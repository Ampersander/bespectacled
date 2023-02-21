<?php

namespace App\Entity;

use ApiPlatform\Metadata\ApiResource;
use App\Repository\VenueRepository;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;
use Symfony\Bridge\Doctrine\Validator\Constraints\UniqueEntity;
use Symfony\Component\Serializer\Annotation\Groups;
use Symfony\Component\Validator\Constraints as Assert;

#[ORM\Entity(repositoryClass: VenueRepository::class)]
#[UniqueEntity(fields: ["name"], message: "This venue already exists")]
// #[ApiResource(
//     normalizationContext: ['groups' => ['venue:read']],
//     denormalizationContext: ['groups' => ['venue:write']],
//     collectionOperations: [
//         'get' => [
//             'normalization_context' => ['groups' => ['venue:read']]
//         ],
//         'post' => [
//             'denormalization_context' => ['groups' => ['venue:write']]
//         ]
//     ],
//     itemOperations: [
//         'get' => [
//             'normalization_context' => ['groups' => ['venue:read']]
//         ],
//         'put' => [
//             'denormalization_context' => ['groups' => ['venue:write']]
//         ],
//         'delete' => [
//             'denormalization_context' => ['groups' => ['venue:write']]
//         ]
//     ]
// )]
class Venue
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(type: "string", length: 55)]
    #[Assert\NotBlank]
    #[Groups(['venue:read', 'venue:write'])]
    private ?string $name = null;

    #[ORM\Column(type: "string", length: 55)]
    #[Assert\NotBlank]
    #[Groups(['venue:read', 'venue:write'])]
    private ?string $type = null;

    #[ORM\Column]
    #[Assert\NotBlank]
    #[Groups(['venue:read', 'venue:write'])]
    private ?int $seats = null;

    #[ORM\Column]
    #[Assert\NotBlank]
    #[Assert\Positive]
    #[Groups(['venue:read', 'venue:write'])]
    private ?float $price = null;

    #[ORM\Column]
    #[Groups(['event:read', 'event:write'])]
    private ?string $src = null;

    #[ORM\OneToMany(mappedBy: 'venue', targetEntity: Event::class)]
    #[Groups(['venue:read'])]
    private Collection $events;

    public function __construct()
    {
        $this->events = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getName(): ?string
    {
        return $this->name;
    }

    public function setName(string $name): self
    {
        $this->name = $name;

        return $this;
    }

    public function getType(): ?string
    {
        return $this->type;
    }

    public function setType(string $type): self
    {
        $this->type = $type;

        return $this;
    }

    public function getSeats(): ?int
    {
        return $this->seats;
    }

    public function setSeats(int $seats): self
    {
        $this->seats = $seats;

        return $this;
    }

    public function getPrice(): ?float
    {
        return $this->price;
    }

    public function setPrice(float $price): self
    {
        $this->price = $price;

        return $this;
    }

    public function getSrc(): ?string
    {
        return $this->src;
    }

    public function setSrc(string $src): self
    {
        $this->src = $src;

        return $this;
    }

    /**
     * @return Collection<int, Event>
     */
    public function getEvents(): Collection
    {
        return $this->events;
    }

    public function addEvent(Event $event): self
    {
        if (!$this->events->contains($event)) {
            $this->events->add($event);
            $event->setVenue($this);
        }

        return $this;
    }

    public function removeEvent(Event $event): self
    {
        if ($this->events->removeElement($event)) {
            // set the owning side to null (unless already changed)
            if ($event->getVenue() === $this) {
                $event->setVenue(null);
            }
        }

        return $this;
    }
}