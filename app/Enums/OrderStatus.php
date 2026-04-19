<?php

namespace App\Enums;

enum OrderStatus: string
{
    case Pending = 'pending';
    case AiCaptured = 'ai_captured';
    case Confirmed = 'confirmed';
    case Shipped = 'shipped';
    case Delivered = 'delivered';
    case Cancelled = 'cancelled';
}
