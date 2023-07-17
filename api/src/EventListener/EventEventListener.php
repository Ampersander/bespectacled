<?php

namespace App\EventListener;

use App\Entity\Event;
use App\Entity\Ticket;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use App\Repository\EventRepository;
use App\Repository\TicketRepository;
use App\Service\StripeService;

class EventEventListener
{

    private $stripeService;


    public function __construct(private EventRepository $eventRepository, private TicketRepository $ticketRepository, StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    public function postPersist(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Event) {
            return;
        }

        $event = $this->eventRepository->find($entity->getId());

        //nb of place in Venue seats
        $nbPlace = $event->getVenue()->getSeats();

        $schedules = $event->getSchedules();

        $entityManager = $args->getObjectManager();
        //create tickets for each schedule date an times

        foreach ($schedules as $schedule) {
            $date = $schedule->getDate();
            $times = $schedule->getTimes();
            foreach ($times as $time) {
                for ($i = 0; $i < $nbPlace; $i++) {
                    $ticket = new Ticket();
                    $ticket->setEvent($event);
                    $ticket->setStatus(-1);
                    $ticket->setDay($date);
                    $ticket->setHour($time);
                    $ticket->setReference(uniqid('', true));
                    $entityManager->persist($ticket);
                }
            }
        }


        $entityManager->flush();
    }

    public function postUpdate(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Event) {
            return;
        }

        /* $event = $this->eventRepository->find($entity->getId());

    // Get the existing schedules before the update
    $originalSchedules = $args->getEntityManager()->getUnitOfWork()->getOriginalEntityData($event)['schedules'];

    // Get the newly added schedules
    $newSchedules = $event->getSchedules()->toArray();

    // Determine the schedules that have been added
    $addedSchedules = array_udiff($newSchedules, $originalSchedules, function ($a, $b) {
        return $a->getId() <=> $b->getId();
    });

    // Number of places in Venue seats
    $nbPlace = $event->getVenue()->getSeats();

    $entityManager = $args->getObjectManager();

    // Create tickets for each newly added schedule
    foreach ($addedSchedules as $schedule) {
        $date = $schedule->getDate();
        $times = $schedule->getTimes();
        foreach ($times as $time) {
            for ($i = 0; $i < $nbPlace; $i++) {
                $ticket = new Ticket();
                $ticket->setEvent($event);
                $ticket->setStatus(-1);
                $ticket->setDay($date);
                $ticket->setHour($time);
                $ticket->setReference(uniqid('', true));
                $entityManager->persist($ticket);
            }
        }
    }

    $entityManager->flush();*/
    }


    public function postRemove(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Event) {
            return;
        }
    }
}
