<?php

declare(strict_types=1);

namespace B4moss\Shardian;

use InvalidArgumentException;

/**
 * @internal
 */
final class ShardianInternal
{
    /**
     * @param array{
     *   dirLetterCount?: int,
     *   dirNestDepth?: int,
     *   stripHeadSlash?: bool,
     *   insufficientChars?: 'ignore'|'warn'|'throw',
     *   extensionOnlyList?: list<string>
     * }|null $option
     *
     * @return array{0: string, 1: string}
     */
    public static function build(string $fileName, ?array $option): array
    {
        $dirLetterCount = 1;
        $dirNestDepth = 4;
        $stripHeadSlash = false;
        $insufficientChars = 'ignore';
        $extensionOnlyList = null;

        if ($option !== null) {
            if (array_key_exists('dirLetterCount', $option)) {
                $dirLetterCount = $option['dirLetterCount'];
            }
            if (array_key_exists('dirNestDepth', $option)) {
                $dirNestDepth = $option['dirNestDepth'];
            }
            if (array_key_exists('stripHeadSlash', $option)) {
                $stripHeadSlash = (bool) $option['stripHeadSlash'];
            }
            if (
                array_key_exists('insufficientChars', $option)
                && $option['insufficientChars'] !== null
                && $option['insufficientChars'] !== ''
            ) {
                $insufficientChars = $option['insufficientChars'];
            }
            if (array_key_exists('extensionOnlyList', $option)) {
                $extensionOnlyList = $option['extensionOnlyList'];
            }
        }

        if ($fileName === '') {
            throw new InvalidArgumentException('fileName must not be empty');
        }
        if ($fileName === '.' || $fileName === '..' || $fileName === './' || $fileName === '../') {
            throw new InvalidArgumentException('fileName must not be a relative path reference');
        }
        if (str_contains($fileName, '/') || str_contains($fileName, '\\')) {
            throw new InvalidArgumentException('fileName must not contain path separators');
        }
        if ($dirLetterCount < 1) {
            throw new InvalidArgumentException('dirLetterCount must be >= 1');
        }
        if ($dirNestDepth < 1) {
            throw new InvalidArgumentException('dirNestDepth must be >= 1');
        }

        $resolvedExtensionList = COMMON_EXTENSIONS;
        if (is_array($extensionOnlyList) && count($extensionOnlyList) > 0) {
            $resolvedExtensionList = $extensionOnlyList;
        }

        foreach ($resolvedExtensionList as $ext) {
            if (!str_starts_with($ext, '.')) {
                throw new InvalidArgumentException(
                    "extensionOnlyList entries must start with '.': received {$ext}"
                );
            }
        }

        $lowerName = strtolower($fileName);
        foreach ($resolvedExtensionList as $ext) {
            if ($lowerName === strtolower($ext)) {
                throw new InvalidArgumentException(
                    "fileName must not be extension-only: {$fileName}"
                );
            }
        }

        $chars = mb_str_split($fileName, 1, 'UTF-8');
        $segments = [];
        $offset = 0;
        $charCount = count($chars);

        for ($i = 0; $i < $dirNestDepth; $i++) {
            if ($charCount - $offset < $dirLetterCount) {
                break;
            }
            $segments[] = implode('', array_slice($chars, $offset, $dirLetterCount));
            $offset += $dirLetterCount;
        }

        if (count($segments) < $dirNestDepth) {
            $msg = sprintf(
                'shardian: requested depth %d but only %d segment(s) for fileName=%s',
                $dirNestDepth,
                count($segments),
                $fileName
            );
            if ($insufficientChars === 'throw') {
                throw new InvalidArgumentException($msg);
            }
            if ($insufficientChars === 'warn') {
                trigger_error($msg, E_USER_WARNING);
            }
        }

        return self::assemblePaths($segments, $fileName, $stripHeadSlash);
    }

    /**
     * @param list<string> $segments
     *
     * @return array{0: string, 1: string}
     */
    private static function assemblePaths(array $segments, string $fileName, bool $stripHeadSlash): array
    {
        if (count($segments) === 0) {
            if ($stripHeadSlash) {
                return [$fileName, ''];
            }

            return ['/' . $fileName, '/'];
        }

        $body = implode('/', $segments);
        if ($stripHeadSlash) {
            return [$body . '/' . $fileName, $body . '/'];
        }

        return ['/' . $body . '/' . $fileName, '/' . $body . '/'];
    }
}
