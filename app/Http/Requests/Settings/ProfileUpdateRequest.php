<?php

namespace App\Http\Requests\Settings;

use App\Concerns\ProfileValidationRules;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class ProfileUpdateRequest extends FormRequest
{
    use ProfileValidationRules;

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $rules = $this->profileRules($this->user()->id);

        if ($this->user()->hasRole('seller')) {
            $rules['ai_auto_reply_enabled'] = ['required', 'boolean'];
            $rules['notification_email'] = ['nullable', 'email', 'max:255'];
            $rules['notification_telegram_chat_id'] = ['nullable', 'string', 'max:64'];
            $rules['delivery_info'] = ['nullable', 'string', 'max:2000'];
        }

        return $rules;
    }
}
