<?php

namespace App\EventListener;

use App\Entity\Ticket;
use App\Service\StripeService;
use Doctrine\Persistence\Event\LifecycleEventArgs;

class TicketEventListener
{
    private $stripeService;

    public function __construct(StripeService $stripeService)
    {
        $this->stripeService = $stripeService;
    }

    public function postPersist(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Ticket) {
            return;
        }

     /*   $stripeTicket = $this->stripeService->createTicket($entity->getName(), $entity->getDescription());
        $entity->setStripeTicketId($stripeTicket->id);
        $stripePrice = $this->stripeService->createPrice($stripeTicket->id, $entity->getPrice());
        $entity->setStripePriceId($stripePrice->id);
        $entityManager = $args->getObjectManager();
        $entityManager->flush();*/
    }

    public function postUpdate(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Ticket) {
            return;
        }

    /*    $stripeTicket = $this->stripeService->updateTicket($entity->getStripeTicketId(), $entity->getName(), $entity->getDescription());
        $entity->setStripeTicketId($stripeTicket->id);
        $stripePrice = $this->stripeService->updatePrice($entity->getStripePriceId(), $entity->getPrice());
        $entity->setStripePriceId($stripePrice->id);
        $entityManager = $args->getObjectManager();
        $entityManager->flush();*/
    }

    public function postRemove(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Ticket) {
            return;
        }

      /*  $this->stripeService->deletePrice($entity->getStripePriceId());
        $this->stripeService->deleteTicket($entity->getStripeTicketId());*/
    }
}