<?php

namespace App\Ai\Support;

class LanguageDetector
{
    /**
     * Detect whether a given text is Uzbek, Russian, or English.
     * Returns one of: 'uz', 'ru', 'en'. Defaults to 'uz'.
     */
    public static function detect(string $text): string
    {
        $trimmed = trim($text);

        if ($trimmed === '') {
            return 'uz';
        }

        $cyrillicCount = preg_match_all('/\p{Cyrillic}/u', $trimmed);
        $latinCount = preg_match_all('/[A-Za-z]/u', $trimmed);

        if ($cyrillicCount > 0 && $cyrillicCount >= $latinCount) {
            return 'ru';
        }

        if ($latinCount === 0) {
            return 'uz';
        }

        $lower = mb_strtolower($trimmed);
        $uzbekHints = ['salom', 'bormi', 'narxi', 'qancha', 'rahmat', 'assalom', 'yaxshi', 'qanday', 'mahsulot', 'buyurtma', 'olmoqchi'];

        foreach ($uzbekHints as $hint) {
            if (str_contains($lower, $hint)) {
                return 'uz';
            }
        }

        return 'en';
    }
}
