<?php

declare(strict_types=1);

namespace B4moss\Shardian;

/**
 * @param array{
 *   dirLetterCount?: int,
 *   dirNestDepth?: int,
 *   stripHeadSlash?: bool,
 *   insufficientChars?: 'ignore'|'warn'|'throw',
 *   extensionOnlyList?: list<string>
 * }|null $option
 */
function shardian(string $fileName, ?array $option = null): string
{
    return ShardianInternal::build($fileName, $option)[0];
}

/**
 * @param array{
 *   dirLetterCount?: int,
 *   dirNestDepth?: int,
 *   stripHeadSlash?: bool,
 *   insufficientChars?: 'ignore'|'warn'|'throw',
 *   extensionOnlyList?: list<string>
 * }|null $option
 */
function shardianSplit(string $fileName, ?array $option = null): SplitPath
{
    [$fullPath, $pathOnly] = ShardianInternal::build($fileName, $option);

    return new SplitPath($fullPath, $pathOnly, $fileName);
}
