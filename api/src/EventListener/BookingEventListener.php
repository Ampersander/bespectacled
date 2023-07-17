<?php

namespace App\EventListener;

use App\Entity\Booking;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use App\Repository\EventRepository;
use App\Repository\BookingRepository;
use App\Repository\TicketRepository;
use App\Service\StripeService;
use App\Enum\BookingStatusEnum;
use App\Email\Mailer;


class BookingEventListener
{

    private $stripeService;


    public function __construct(private BookingRepository $bookingRepository, StripeService $stripeService, private Mailer $mailer)
    {
        $this->stripeService = $stripeService;
    }


    public function postUpdate(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();

        // Vérifiez si l'entité est de type Event et si la propriété souhaitée a changé
        if ($entity instanceof Booking) {
            $unitOfWork = $args->getObjectManager()->getUnitOfWork();
            $changeset = $unitOfWork->getEntityChangeSet($entity);

            if (isset($changeset['status'])) {

                $booking = $this->bookingRepository->find($entity->getId());

                //if booking have state validated 
                if ($booking->getStatus() === BookingStatusEnum::VALIDATED) {

                    $this->stripeService->confirmPaymentBooking($booking);
                }

                //if booking have state cancelled
                if ($booking->getStatus() === BookingStatusEnum::CANCELLED) {

                    $this->mailer->sendBookingCancelled($booking);
                }
            }
        }
    }

}
