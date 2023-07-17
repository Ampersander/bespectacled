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
    }

    public function postUpdate(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Ticket) {
            return;
        }
    }

    public function postRemove(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();
        if (!$entity instanceof Ticket) {
            return;
        }
    }
}
