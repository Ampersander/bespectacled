<?php

namespace App\Security;

use App\Exception\InvalidConfirmationTokenException;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Psr\Log\LoggerInterface;
use App\Security\TokenGenerator;
use App\Email\Mailer;

class UserRecoverService
{

    public function __construct(
        private Mailer $mailer,
        private LoggerInterface $logger,
        private TokenGenerator $tokenGenerator,
        private UserRepository $userRepository,
        private EntityManagerInterface $entityManager
    ) {}

    public function recoverPassword(string $email)
    {
        $this->logger->debug('Fetching user email');
        $user = $this->userRepository->findOneBy(compact('email'));

        // If user was not found
        if (!$user) {
            $this->logger->debug('User by email not found');
            throw new \Exception('User by email not found');
        }

        // Create confirmation token
        $user->setConfirmationToken($this->tokenGenerator->getRandomSecureToken());
        $this->entityManager->flush();

        // Send recovery mail
        $this->mailer->sendRecoverPasswordEmail($user);
        $this->logger->debug('Password Recovery Email Sent');
    }
}