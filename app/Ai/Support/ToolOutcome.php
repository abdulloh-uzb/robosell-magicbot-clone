<?php

namespace App\Ai\Support;

/**
 * Tracks side-effect tool invocations during a single agent run
 * so the orchestrator can decide which reply to send.
 */
class ToolOutcome
{
    public bool $offTopicReported = false;

    public bool $handoffRequested = false;

    public bool $orderCaptured = false;

    public ?int $capturedOrderId = null;

    public ?string $handoffReason = null;

    public function reset(): void
    {
        $this->offTopicReported = false;
        $this->handoffRequested = false;
        $this->orderCaptured = false;
        $this->capturedOrderId = null;
        $this->handoffReason = null;
    }
}
