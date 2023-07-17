<?php

namespace App\Email;

use App\Entity\User;
use Symfony\Component\Mime\Address;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;

class Mailer extends AbstractController
{
	public function __construct(private MailerInterface $mailer)
	{
	}

	public function sendConfirmationEmail(User $user): void
	{
		$email = (new TemplatedEmail())
			->from(new Address('contact@bespectacled.com', 'BeSpectacled'))
			->to($user->getEmail())
			->subject('Please confirm your account!')
			->htmlTemplate('emails/confirmation.html.twig')
			->context(compact('user'));

		try {
			$this->mailer->send($email);
		} catch (TransportExceptionInterface $e) {
			PHP_EOL . $e;
		}
	}

	public function sendRecoverPasswordEmail(User $user): void
	{
		$email = (new TemplatedEmail())
			->from(new Address('contact@bespectacled.com', 'BeSpectacled'))
			->to($user->getEmail())
			->subject('Recover your account!')
			->htmlTemplate('emails/recover-password.html.twig')
			->context(compact('user'));

		try {
			$this->mailer->send($email);
		} catch (TransportExceptionInterface $e) {
			PHP_EOL . $e;
		}
	}

	//function to send email when a ticket is bought
	public function sendTicketEmail(User $user, $event, $ticket): void
	{
		$email = (new TemplatedEmail())
			->from(new Address('contact@bespectacled.com', 'BeSpectacled'))
			->to($user->getEmail())
			->subject('Your ticket for the event ' . $event->getTitle() . '!')
			->htmlTemplate('emails/ticket.html.twig')
			->context(compact('user', 'event', 'ticket'));

		try {
			$this->mailer->send($email);
		} catch (TransportExceptionInterface $e) {
			PHP_EOL . $e;
		}
	}

	public function sendAskToBecomeArtist($user): void
	{
		$email = (new TemplatedEmail())
			->from(new Address('contact@bespectacled.com', 'BeSpectacled'))
			->to('admin@bespectacled.com')
			->subject('A user ask to become an artist!')
			->htmlTemplate('emails/ask-to-become-artist.html.twig')
			->context(compact('user'));

		try {
			$this->mailer->send($email);
		} catch (TransportExceptionInterface $e) {
			PHP_EOL . $e;
		}
	}

	public function sendBookingValidated($booking): void
	{
		$email = (new TemplatedEmail())
			->from(new Address('contact@bespectacled.com', 'BeSpectacled'))
			->to($booking->getClient()->getEmail())
			->subject('Your booking is validated!')
			->htmlTemplate('emails/booking-validated.html.twig')
			->context(compact('booking'));

		try {
			$this->mailer->send($email);
		} catch (TransportExceptionInterface $e) {
			PHP_EOL . $e;
		}
	}

	//sendBookingCancelled

	public function sendBookingCancelled($booking): void
	{
		$email = (new TemplatedEmail())
			->from(new Address('contact@bespectacled.com', 'BeSpectacled'))
			->to($booking->getClient()->getEmail())
			->subject('Your booking is cancelled!')
			->htmlTemplate('emails/booking-cancelled.html.twig')
			->context(compact('booking'));

		try {
			$this->mailer->send($email);
		} catch (TransportExceptionInterface $e) {
			PHP_EOL . $e;
		}
	}

	//sendAskBooking
	public function sendAskBooking($booking): void
	{
		$email = (new TemplatedEmail())
			->from(new Address('contact@bespectacled.com', 'BeSpectacled'))
			->to($booking->getClient()->getEmail())
			->subject('A user ask to book a venue!')
			->htmlTemplate('emails/ask-booking.html.twig')
			->context(compact('booking'));

		try {
			$this->mailer->send($email);
		} catch (TransportExceptionInterface $e) {
			PHP_EOL . $e;
		}
	}
}
