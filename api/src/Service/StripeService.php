<?php

namespace App\Service;

use Stripe\Stripe;
use Stripe\Product as StripeProduct;
use Doctrine\ORM\EntityManagerInterface;
//add mailer
use App\Entity\Event;
use App\Entity\User;
use App\Enum\TicketStatusEnum;
use App\Email\Mailer;

class StripeService
{
    private $secretKey;
    private $entityManager;
    private $mailer;

    public function __construct(string $secretKey, EntityManagerInterface $entityManager, Mailer $mailer)
    {
        $this->secretKey = $secretKey;
        $this->entityManager = $entityManager;
        $this->mailer = $mailer;
    }


    public function createEvent(string $name, string $description): StripeProduct
    {
        Stripe::setApiKey($this->secretKey);
        return StripeProduct::create([
            'name' => $name,
            'description' => $description,
            'type' => 'good',
            'attributes' => ['size', 'color'],
        ]);
    }

    public function updateEvent(string $ticketId, string $name, string $description): StripeProduct
    {
        Stripe::setApiKey($this->secretKey);
        $stripeProduct = StripeProduct::retrieve($ticketId);
        $stripeProduct->name = $name;
        $stripeProduct->description = $description;
        $stripeProduct->save();
        return $stripeProduct;
    }


    public function deleteEvent(string $ticketId): StripeProduct
    {
        Stripe::setApiKey($this->secretKey);
        $stripeProduct = StripeProduct::retrieve($ticketId);
        $stripeProduct->delete();
        return $stripeProduct;
    }

    public function createPrice(string $ticketId, int $price): StripeProduct
    {
        Stripe::setApiKey($this->secretKey);
        return StripeProduct::create([
            'unit_amount' => $price,
            'currency' => 'usd',
            'product' => $ticketId,
        ]);
    }

    public function updatePrice(string $priceId, int $price): StripeProduct
    {
        Stripe::setApiKey($this->secretKey);
        $stripeProduct = StripeProduct::retrieve($priceId);
        $stripeProduct->unit_amount = $price;
        $stripeProduct->save();
        return $stripeProduct;
    }

    public function deletePrice(string $priceId): StripeProduct
    {
        Stripe::setApiKey($this->secretKey);
        $stripeProduct = StripeProduct::retrieve($priceId);
        $stripeProduct->delete();
        return $stripeProduct;
    }


    public function generatePaymentIntent($price, Event $event)
    {
        //get a ticket from the event with status created

        $ticket = $event->getTickets()->filter(function ($ticket) {
            return $ticket->getStatus() === TicketStatusEnum::CREATE;
        })->first();

        if (!$ticket) {
            throw new \Exception('No ticket available');
        }

        $stripe = new \Stripe\StripeClient($this->secretKey);

        $paymentIntent = $stripe->paymentIntents->create([
            'amount' => $price,
            'currency' => 'eur',
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
        ]);

        $ticket->setStatus(TicketStatusEnum::PENDING);
        $this->entityManager->flush();


        return $paymentIntent;
    }

    //check if payment is successful
    public function checkPayment($paymentIntentId, Event $event, User $user)
    {
        $data = null;
        try {
            $stripe = new \Stripe\StripeClient($this->secretKey);
            $paymentIntent = $stripe->paymentIntents->retrieve(
                $paymentIntentId,
                []
            );
            $ticket = $event->getTickets()->filter(function ($ticket) {
                return $ticket->getStatus() === TicketStatusEnum::PENDING;
            })->first();
            if (!$ticket) {
                throw new \Exception('No ticket available');
            }
            // Vérifiez l'état du paiement (succeeded, pending, etc.)
            if ($paymentIntent->status === 'succeeded') {


                $ticket->setStatus(TicketStatusEnum::PAID);
                $ticket->setBuyer($user);
                $this->entityManager->flush();

                $this->mailer->sendTicketEmail($user, $event, $ticket);

                $data = [
                    'status' => 'success',
                    'ticket' => $ticket
                ];

                // Paiement réussi, effectuez les actions nécessaires (par exemple, marquez le ticket comme payé dans la base de données)
            } else {
                $ticket->setStatus(TicketStatusEnum::CREATE);
                $this->entityManager->flush();
                // Le paiement a échoué, effectuez les actions nécessaires (par exemple, affichez un message d'erreur à l'utilisateur)
            }
        } catch (\Stripe\Exception\ApiErrorException $e) {
            // Affichez un message d'erreur à l'utilisateur

            $ticket->setStatus(TicketStatusEnum::CREATE);
            $this->entityManager->flush();
            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        return $data;
    }
}
