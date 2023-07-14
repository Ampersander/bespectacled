<?php
namespace App\Enum;

class TicketStatusEnum
{
    public const CREATE = -1;
    public const PENDING = 0;
    public const PAID = 1;
    public const CANCELLED = 2;

    public static function getChoices(): array {
        return [
            self::CREATE => 'Create',
            self::PENDING => 'Pending',
            self::PAID => 'Paid',
            self::CANCELLED => 'Cancelled'
        ];
    }
}