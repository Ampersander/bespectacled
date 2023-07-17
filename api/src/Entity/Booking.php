<?php

namespace App\Entity;

use Doctrine\DBAL\Types\Types;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\BookingRepository;
use App\Enum\BookingStatusEnum;
use ApiPlatform\Metadata\ApiResource;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: BookingRepository::class)]
#[ApiResource(
    normalizationContext: ['groups' => ['booking:read']],
    denormalizationContext: ['groups' => ['booking:write']],
    // security: "is_granted('IS_AUTHENTICATED_FULLY') and object == user or is_granted('ROLE_ADMIN')",
)]
class Booking
{
    #[ORM\Id, ORM\Column, ORM\GeneratedValue]
    private ?int $id = null;

    #[Assert\NotBlank]
    #[ORM\Column(type: Types::INTEGER)]
    #[Groups(['booking:read', 'booking:write', 'user:read', 'venue:read', 'transaction:read'])]
    private int $status = BookingStatusEnum::PENDING;

    #[Assert\NotBlank]
    #[Groups(['booking:read', 'booking:write'])]
    #[ORM\ManyToOne(inversedBy: 'bookings'), ORM\JoinColumn(nullable: false)]
    private ?User $client = null;

    #[Assert\NotBlank]
    #[Groups(['booking:read', 'booking:write'])]
    #[ORM\ManyToOne(inversedBy: 'bookings'), ORM\JoinColumn(nullable: false)]
    private ?Venue $venue = null;

    #[Groups(['booking:read', 'booking:write'])]
    #[ORM\ManyToOne(inversedBy: 'bookings'), ORM\JoinColumn(nullable: true)]
    private ?Transaction $transaction = null;

    //add date
    #[Assert\NotBlank]
    #[Groups(['booking:read', 'booking:write'])]
    #[ORM\Column(type: Types::DATE_MUTABLE)]
    private ?\DateTimeInterface $date = null;

    //add PaymentIntentId
    #[Groups(['booking:read', 'booking:write'])]
    #[ORM\Column(type: Types::STRING, nullable: true)]
    private ?string $paymentIntentId = null;

    //add lastModified
    #[Groups(['booking:read', 'booking:write'])]
    #[ORM\Column(type: Types::DATETIME_MUTABLE, nullable: true)]
    private ?\DateTimeInterface $lastModified = null;


    public function getId(): ?int
    {
        return $this->id;
    }

    public function getStatus(): int
    {
        return $this->status;
    }

    public function setStatus($status): self
    {
        $this->status = $status;

        return $this;
    }

    public function getClient(): ?User
    {
        return $this->client;
    }

    public function setClient(?User $client): self
    {
        $this->client = $client;

        return $this;
    }

    public function getVenue(): ?Venue
    {
        return $this->venue;
    }

    public function setVenue(?Venue $venue): self
    {
        $this->venue = $venue;

        return $this;
    }

    public function getTransaction(): ?Transaction
    {
        return $this->transaction;
    }

    public function setTransaction(?Transaction $transaction): self
    {
        $this->transaction = $transaction;

        return $this;
    }

    public function getDate(): ?\DateTimeInterface
    {
        return $this->date;
    }

    public function setDate(\DateTimeInterface $date): self
    {
        $this->date = $date;

        return $this;
    }

    public function getPaymentIntentId(): ?string
    {
        return $this->paymentIntentId;
    }

    public function setPaymentIntentId(?string $paymentIntentId): self
    {
        $this->paymentIntentId = $paymentIntentId;

        return $this;
    }

    public function getLastModified(): ?\DateTimeInterface
    {
        return $this->lastModified;
    }

    public function setLastModified(?\DateTimeInterface $lastModified): self
    {
        $this->lastModified = $lastModified;

        return $this;
    }
}