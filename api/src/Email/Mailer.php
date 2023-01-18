<?php

namespace App\Email;

use App\Entity\User;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Mime\Address;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class Mailer extends AbstractController
{

    public function __construct(private MailerInterface $mailer) {}

    public function sendConfirmationEmail(User $user): void
	{

		$email = (new TemplatedEmail())
			->from(new Address('contact@bespectacled.com', 'Bespectacled'))
			->to($user->getEmail())
			->subject('Please confirm your account!')
			->htmlTemplate('email/confirmation.html.twig')
			->context(compact('user'));

		try {
			$this->mailer->send($email);
		} catch (TransportExceptionInterface $e) {
			PHP_EOL . $e;
		}
	}

    public function sendRecoverPasswordEmail(User $user): void{
        $email = (new TemplatedEmail())
			->from(new Address('contact@bespectacled.com', 'Bespectacled'))
			->to($user->getEmail())
			->subject('Recover your account!')
			->htmlTemplate('email/recover-password.html.twig')
			->context(compact('user'));

		try {
			$this->mailer->send($email);
		} catch (TransportExceptionInterface $e) {
			PHP_EOL . $e;
		}
    }
    
}