<?php

declare(strict_types=1);

namespace B4moss\Shardian;

final class SplitPath
{
    public function __construct(
        public readonly string $fullPath,
        public readonly string $pathOnly,
        public readonly string $fileNameOnly,
    ) {
    }
}
