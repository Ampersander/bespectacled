<?php

namespace App\Security;

use App\Exception\InvalidConfirmationTokenException;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;

class UserConfirmationService
{

    public function __construct(
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager,
        private LoggerInterface $logger
    )
    {
    }

    public function confirmUser(string $confirmationToken)
    {
        $this->logger->debug('Fetching user by confirmation token');

        $user = $this->userRepository->findOneBy(
            ['confirmationToken' => $confirmationToken]
        );

        // User was NOT found by confirmation token
        if (!$user) {
            $this->logger->debug('User by confirmation token not found');
            throw new InvalidConfirmationTokenException();
        }

        $user->setEnabled(true);
        $user->setConfirmationToken(null);
        $this->entityManager->flush();

        $this->logger->debug('Confirmed user by confirmation token');
    }
}