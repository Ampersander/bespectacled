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
use App\Entity\Ticket;
use App\Entity\Transaction;

class StripeService
{
    private $stripeSK;
    private $entityManager;
    private $mailer;

    public function __construct(string $stripeSK, EntityManagerInterface $entityManager, Mailer $mailer)
    {
        $this->stripeSK = $stripeSK;
        $this->entityManager = $entityManager;
        $this->mailer = $mailer;
    }


    public function createEvent(string $name, string $description): StripeProduct
    {
        Stripe::setApiKey($this->stripeSK);
        return StripeProduct::create([
            'name' => $name,
            'description' => $description,
            'type' => 'good',
            'attributes' => ['size', 'color'],
        ]);
    }

    public function updateEvent(string $ticketId, string $name, string $description): StripeProduct
    {
        Stripe::setApiKey($this->stripeSK);
        $stripeProduct = StripeProduct::retrieve($ticketId);
        $stripeProduct->name = $name;
        $stripeProduct->description = $description;
        $stripeProduct->save();
        return $stripeProduct;
    }


    public function deleteEvent(string $ticketId): StripeProduct
    {
        Stripe::setApiKey($this->stripeSK);
        $stripeProduct = StripeProduct::retrieve($ticketId);
        $stripeProduct->delete();
        return $stripeProduct;
    }

    public function createPrice(string $ticketId, int $price): StripeProduct
    {
        Stripe::setApiKey($this->stripeSK);
        return StripeProduct::create([
            'unit_amount' => $price,
            'currency' => 'usd',
            'product' => $ticketId,
        ]);
    }

    public function updatePrice(string $priceId, int $price): StripeProduct
    {
        Stripe::setApiKey($this->stripeSK);
        $stripeProduct = StripeProduct::retrieve($priceId);
        $stripeProduct->unit_amount = $price;
        $stripeProduct->save();
        return $stripeProduct;
    }

    public function deletePrice(string $priceId): StripeProduct
    {
        Stripe::setApiKey($this->stripeSK);
        $stripeProduct = StripeProduct::retrieve($priceId);
        $stripeProduct->delete();
        return $stripeProduct;
    }


    public function generatePaymentIntent(Event $event, $date, $time, $user)
    {
        //create a ticket with status TicketStatusEnum::CREATE

      /*  $ticket = new Ticket();
        $ticket->setEvent($event);
        $ticket->setReference(uniqid());
        $ticket->setStatus(TicketStatusEnum::CREATE);
        $ticket->setDay($date);
        $ticket->setHour($time);

        $this->entityManager->persist($ticket);
        $this->entityManager->flush();*/


        //and verify if schedule is available
        $schedule = $event->getSchedules()->filter(function ($schedule) use ($date, $time) {
            return $schedule->getDate() === $date && in_array($time, $schedule->getTimes());
        })->first();

        if(!$schedule){
            throw new \Exception('Schedule not available');
        }

        //find the number of place with the state TicketStatusEnum::CREATE with the schedule

        $numberTicket = $event->getTickets()->filter(function ($ticket) use ($schedule, $date, $time) {
            return $ticket->getStatus() === TicketStatusEnum::CREATE && $schedule->getDate() === $date && in_array($time, $schedule->getTimes());
        })->count();

        //if numberTicket is equal to 0, throw an exception
        if ($numberTicket === 0) {
            throw new \Exception('No ticket available');
        }

        $ticket = $event->getTickets()->filter(function ($ticket) {
            return $ticket->getStatus() === TicketStatusEnum::CREATE;
        })->first();

        if (!$ticket) {
            throw new \Exception('No ticket available');
        }

        $price = $event->getPrice() *100;

        $stripe = new \Stripe\StripeClient($this->stripeSK);

        $paymentIntent = $stripe->paymentIntents->create([
            'amount' => $price,
            'currency' => 'eur',
            'automatic_payment_methods' => [
                'enabled' => true,
            ],
        ]);
        $ticket->setPaymentIntentId($paymentIntent->client_secret);
        $ticket->setBuyer($user);

        $ticket->setStatus(TicketStatusEnum::PENDING);
        $this->entityManager->flush();

        return [
            'status' => 'success',
            'clientSecret' => $paymentIntent->client_secret,
        ];
    }


    //check if payment is successful
    public function checkPayment($paymentIntentId)
    {
        $data = null;
        try {
            $stripe = new \Stripe\StripeClient($this->stripeSK);


            $pi = explode("_secret_", $paymentIntentId)[0];
            $paymentIntent = $stripe->paymentIntents->retrieve(
                $pi,
                []
            );
            //recover ticket with paymentIntentId
            $ticket = $this->entityManager->getRepository(Ticket::class)->findOneBy(['paymentIntentId' => $paymentIntentId]);

            // Vérifiez l'état du paiement (succeeded, pending, etc.)
            if ($paymentIntent->status === 'succeeded') {

                $ticket->setStatus(TicketStatusEnum::PAID);
                $this->entityManager->flush();
                //get user from ticket
                $user = $ticket->getBuyer();
                //get event from ticket
                $event = $ticket->getEvent();

                $this->mailer->sendTicketEmail($user, $event, $ticket);

                $data = [
                    'status' => 'success',
                    'ticket' => $ticket
                ];

                // Paiement réussi, effectuez les actions nécessaires (par exemple, marquez le ticket comme payé dans la base de données)
            } else {
                // Le paiement a échoué, effectuez les actions nécessaires (par exemple, affichez un message d'erreur à l'utilisateur)
            }
        } catch (\Stripe\Exception\ApiErrorException $e) {
            // Affichez un message d'erreur à l'utilisateur

            $data = [
                'status' => 'error',
                'message' => $e->getMessage()
            ];
        }

        return $data;
    }
}