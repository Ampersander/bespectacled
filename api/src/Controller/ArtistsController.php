<?php

namespace App\Controller;

use App\Repository\UserRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class ArtistsController extends AbstractController
{
    public function __construct(
        private UserRepository $userRepository
    ) {}

    public function __invoke()
    {
        // findBy roles = ROLE_ARTIST but in JSON
        return $this->userRepository->findByRole('ROLE_ARTIST');
    }
}