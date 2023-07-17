<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use App\Service\StripeService;
use App\Entity\Event;
use App\Entity\User;
use ApiPlatform\Core\Annotation\ApiResource;
use App\Entity\Venue;

#[ApiResource(
  collectionOperations: [],
  itemOperations: [
    'payment_generate_intent' => [
      'method' => 'POST',
      'path' => '/api/payment_generate_intent',
      'controller' => 'App\Controller\PaymentController::generatePaymentIntent',
      'security' => "is_granted('IS_AUTHENTICATED_FULLY')",
      'openapi_context' => [
        'summary' => 'Generate payment intent',
        'requestBody' => [
          'content' => [
            'application/json' => [
              'schema' => [
                'type' => 'object',
                'properties' => [
                  'price' => [
                    'type' => 'integer',
                    'example' => 1000,
                  ],
                  'eventId' => [
                    'type' => 'integer',
                    'example' => 1,
                  ],
                  'date' => [
                    'type' => 'string',
                    'example' => '2021-06-01',
                  ],
                  'time' => [
                    'type' => 'string',
                    'example' => '20:00',
                  ],
                ],
              ],
            ],
          ],
        ],
        'responses' => [
          '200' => [
            'description' => 'Payment intent generated',
            'content' => [
              'application/json' => [
                'schema' => [
                  'type' => 'object',
                  'properties' => [
                    'clientSecret' => [
                      'type' => 'string',
                      'example' => 'pi_1J4gYt2eZvKYlo2C0QY2Y0Zg_secret_2X2X2X2X2X2X2X2X2X2X',
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
    ],
    'payment_check' => [
      'method' => 'POST',
      'path' => '/api/payment_check',
      'controller' => 'App\Controller\PaymentController::checkPayment',
      'security' => "is_granted('IS_AUTHENTICATED_FULLY')",
      'openapi_context' => [
        'summary' => 'Check payment',
        'requestBody' => [
          'content' => [
            'application/json' => [
              'schema' => [
                'type' => 'object',
                'properties' => [
                  'paymentIntentId' => [
                    'type' => 'string',
                    'example' => 'pi_1J4gYt2eZvKYlo2C0QY2Y0Zg',
                  ],
                  'idEvent' => [
                    'type' => 'integer',
                    'example' => 1,
                  ],
                  'idUser' => [
                    'type' => 'integer',
                    'example' => 1,
                  ],
                ],
              ],
            ],
          ],
        ],
        'responses' => [
          '200' => [
            'description' => 'Payment successful',
            'content' => [
              'application/json' => [
                'schema' => [
                  'type' => 'object',
                  'properties' => [
                    'message' => [
                      'type' => 'string',
                      'example' => 'Payment successful',
                    ],
                  ],
                ],
              ],
            ],
          ],
        ],
      ],
    ],
  ]
)]
class PaymentController extends AbstractController
{
  private $stripeService;

  public function __construct(StripeService $stripeService)
  {
    $this->stripeService = $stripeService;
  }

  #[Route('/api/generate-intent', name: 'payment_generate_intent', methods: ['POST'])]
  public function generatePaymentIntent(Request $request, EntityManagerInterface $entityManager, RequestStack $requestStack): Response
  {
    $content = json_decode($request->getContent());
    $eventId = $content->eventId;
    $date = $content->date;
    $time = $content->time;

    $event = $entityManager->getRepository(Event::class)->find($eventId);
    $user = $this->getUser();

    $data = $this->stripeService->generatePaymentIntent($event, $date, $time, $user);

    $response = new Response(json_encode($data));
    $response->headers->set('Content-Type', 'application/json');

    return $response;
  }

  //check if payment is successful
  #[Route('/api/check-payment', name: 'payment_check', methods: ['POST'])]
  public function checkPayment(Request $request): Response
  {
    //get payment intent id from request
    $content = json_decode($request->getContent());
    $paymentIntentId = $content->paymentIntentId;

    $data = $this->stripeService->checkPayment($paymentIntentId);
    $response = new Response(json_encode($data));
    $response->headers->set('Content-Type', 'application/json');

    return $response;
  }

  public function checkTicketAvailable(Event $event, User $user)
  {
  }

  #[Route('/api/generate-intent-booking', name: 'payment_generate_intent_booking', methods: ['POST'])]
  public function generatePaymentIntentBooking(Request $request, EntityManagerInterface $entityManager): Response
  {
    $content = json_decode($request->getContent());
    $venueId = $content->venueId;
    $date = $content->date;
    $paymentMethodId = $content->paymentMethodId;

    $venue = $entityManager->getRepository(Venue::class)->find($venueId);
    $user = $this->getUser();

    $data = $this->stripeService->generatePaymentIntentBooking($venue, $date, $user, $paymentMethodId);

    $response = new Response(json_encode($data));
    $response->headers->set('Content-Type', 'application/json');

    return $response;
  }
}
