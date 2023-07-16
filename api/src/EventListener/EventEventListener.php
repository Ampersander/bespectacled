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
        var_dump($event);

        //nb of place in Venue seats
        $nbPlace = $event->getVenue()->getSeats();
        var_dump($nbPlace);

        $schedules = $event->getSchedules();
        var_dump($schedules);

        $entityManager = $args->getObjectManager();
        //create tickets for each schedule date an times

        foreach ($schedules as $schedule) {
            $date = $schedule->getDate();
            $times = $schedule->getTimes();
            foreach ($times as $time) {
                $ticket = new Ticket();
                $ticket->setEvent($event);
                $ticket->setPrice($event->getPrice());
                $ticket->setReference(uniqid());
                $ticket->setStatus(-1);
                $ticket->setDate($date);
                $ticket->setTime($time);
                for ($i = 0; $i < $nbPlace; $i++) {
                    $ticket->setReference(uniqid());
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

        $event = $this->eventRepository->find($entity->getId());

        

        $entityManager = $args->getObjectManager();
        $entityManager->flush();
    }

    public function postRemove(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Event) {
            return;
        }

        /*  $this->stripeService->deletePrice($entity->getStripePriceId());
        $this->stripeService->deleteEvent($entity->getStripeEventId());*/
    }
}