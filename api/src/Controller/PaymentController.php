<?php

namespace App\Controller;

use App\Entity\Transaction;
use Stripe\Checkout\Session;
use Stripe\Stripe;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use App\Services\StripeService;

class PaymentController extends AbstractController
{
  private $stripeService;

  public function __construct(StripeService $stripeService)
  {
    $this->stripeService = $stripeService;
  }

  #[Route('/generatePaymentIntent', name: 'generatePaymentIntent')]
  public function generatePaymentIntent(Request $request, EntityManagerInterface $entityManager, RequestStack $requestStack): Response
  {
    //get price from request
    $content = json_decode($request->getContent());
    $price = $content->price;
    $eventId = $content->eventId;
    $event = $entityManager->getRepository(Event::class)->find($eventId);


   return  $this->stripeService->generatePaymentIntent($price, $event);

  }

  //check if payment is successful
  #[Route('/checkPayment', name: 'checkPayment')]
  public function checkPayment(Request $request, EntityManagerInterface $entityManager, RequestStack $requestStack): Response
  {
    //get payment intent id from request
    $content = json_decode($request->getContent());
    $paymentIntentId = $content->paymentIntentId;
    $idEvent = $content->idEvent;
    $event = $entityManager->getRepository(Event::class)->find($idEvent);
    $idUser = $content->idUser;
    $user = $entityManager->getRepository(User::class)->find($idUser);

    return $this->stripeService->checkPayment($paymentIntentId, $event, $user);
  }

    
}
