<?php

namespace App\EventListener;

use App\Entity\User;
use Doctrine\Persistence\Event\LifecycleEventArgs;
use App\Repository\UserRepository;
use App\Enum\UserStatusEnum;
use App\Email\Mailer;


class UserEventListener
{

    public function __construct(private UserRepository $userRepository, private Mailer $mailer)
    {
    }

    public function postUpdate(LifecycleEventArgs $args): void
    {
        $entity = $args->getObject();

        // Vérifiez si l'entité est de type Event et si la propriété souhaitée a changé
        if ($entity instanceof User) {
            $unitOfWork = $args->getObjectManager()->getUnitOfWork();
            $changeset = $unitOfWork->getEntityChangeSet($entity);

            // Vérifiez si le rôle ASK_TO_BECOME_ARTIST a été ajouté
            if (isset($changeset['roles']) && in_array('ASK_TO_BECOME_ARTIST', $changeset['roles'][1])) {
                // Les rôles ont été modifiés, vérifiez si le rôle ASK_TO_BECOME_ARTIST a été ajouté
                $newRoles = $changeset['roles'][1];
                if (in_array('ASK_TO_BECOME_ARTIST', $newRoles)) {
                    // Le rôle ASK_TO_BECOME_ARTIST a été ajouté, exécutez votre logique ici
                    // Par exemple, envoyez un e-mail
                    $this->mailer->sendAskToBecomeArtist($entity);
                }
            }
        }
    }
}
