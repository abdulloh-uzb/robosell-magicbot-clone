<?php

namespace App\Ai\Support;

class ChatAction
{
    public const SEND_REPLY = 'send_reply';

    public const SEND_REFUSAL = 'send_refusal';

    public const STAY_SILENT = 'stay_silent';

    public const HANDOFF = 'handoff';

    public function __construct(
        public readonly string $action,
        public readonly ?string $text = null,
    ) {}

    public static function reply(string $text): self
    {
        return new self(self::SEND_REPLY, $text);
    }

    public static function refusal(string $text): self
    {
        return new self(self::SEND_REFUSAL, $text);
    }

    public static function silent(): self
    {
        return new self(self::STAY_SILENT);
    }

    public static function handoff(string $text): self
    {
        return new self(self::HANDOFF, $text);
    }

    public function shouldSend(): bool
    {
        return $this->action !== self::STAY_SILENT && $this->text !== null;
    }
}
