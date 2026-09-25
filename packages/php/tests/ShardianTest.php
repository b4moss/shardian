<?php

declare(strict_types=1);

namespace B4moss\Shardian\Tests;

use B4moss\Shardian\SplitPath;
use InvalidArgumentException;
use PHPUnit\Framework\TestCase;

use function B4moss\Shardian\shardian;
use function B4moss\Shardian\shardianSplit;

final class ShardianTest extends TestCase
{
    public function testBuildsFullPathWithDefaultsAndNoWarn(): void
    {
        $warnings = $this->captureWarnings(function () use (&$got): void {
            $got = shardian('abc1234.jpg');
        });

        $this->assertSame('/a/b/c/1/abc1234.jpg', $got);
        $this->assertSame([], $warnings);
    }

    public function testBuildsTwoCharSegmentsWithoutWarn(): void
    {
        $warnings = $this->captureWarnings(function () use (&$got): void {
            $got = shardian('abcdef', [
                'dirLetterCount' => 2,
                'dirNestDepth' => 2,
            ]);
        });

        $this->assertSame('/ab/cd/abcdef', $got);
        $this->assertSame([], $warnings);
    }

    public function testStripsHeadSlashWhenStripHeadSlashIsTrue(): void
    {
        $warnings = $this->captureWarnings(function () use (&$got): void {
            $got = shardian('abc1234.jpg', ['stripHeadSlash' => true]);
        });

        $this->assertSame('a/b/c/1/abc1234.jpg', $got);
        $this->assertSame([], $warnings);
    }

    public function testShardianSplitReturnsSplitPathWithoutWarn(): void
    {
        $warnings = $this->captureWarnings(function () use (&$got): void {
            $got = shardianSplit('abc1234.jpg');
        });

        $this->assertInstanceOf(SplitPath::class, $got);
        $this->assertSame('/a/b/c/1/abc1234.jpg', $got->fullPath);
        $this->assertSame('/a/b/c/1/', $got->pathOnly);
        $this->assertSame('abc1234.jpg', $got->fileNameOnly);
        $this->assertSame([], $warnings);
    }

    public function testShardianSplitStripsHeadSlash(): void
    {
        $got = shardianSplit('abc1234.jpg', ['stripHeadSlash' => true]);

        $this->assertSame('a/b/c/1/abc1234.jpg', $got->fullPath);
        $this->assertSame('a/b/c/1/', $got->pathOnly);
        $this->assertSame('abc1234.jpg', $got->fileNameOnly);
    }

    public function testZeroSegmentsReturnsFilenameWithLeadingSlash(): void
    {
        $warnings = $this->captureWarnings(function () use (&$got): void {
            $got = shardian('a', [
                'dirLetterCount' => 2,
                'dirNestDepth' => 3,
            ]);
        });

        $this->assertSame('/a', $got);
        $this->assertSame([], $warnings);
    }

    public function testZeroSegmentsWithStripHeadSlash(): void
    {
        $got = shardian('a', [
            'dirLetterCount' => 2,
            'dirNestDepth' => 3,
            'stripHeadSlash' => true,
        ]);

        $this->assertSame('a', $got);
    }

    public function testShardianSplitZeroSegments(): void
    {
        $got = shardianSplit('a', [
            'dirLetterCount' => 2,
            'dirNestDepth' => 3,
        ]);

        $this->assertSame('/a', $got->fullPath);
        $this->assertSame('/', $got->pathOnly);
        $this->assertSame('a', $got->fileNameOnly);
    }

    public function testShardianSplitZeroSegmentsWithStripHeadSlash(): void
    {
        $got = shardianSplit('a', [
            'dirLetterCount' => 2,
            'dirNestDepth' => 3,
            'stripHeadSlash' => true,
        ]);

        $this->assertSame('a', $got->fullPath);
        $this->assertSame('', $got->pathOnly);
        $this->assertSame('a', $got->fileNameOnly);
    }

    public function testShortNameIgnoresInsufficientCharsByDefault(): void
    {
        $warnings = $this->captureWarnings(function () use (&$got): void {
            $got = shardian('ab', [
                'dirLetterCount' => 1,
                'dirNestDepth' => 4,
            ]);
        });

        $this->assertSame('/a/b/ab', $got);
        $this->assertSame([], $warnings);
    }

    public function testShortNameWarnsWhenInsufficientCharsIsWarn(): void
    {
        $warnings = $this->captureWarnings(function () use (&$got): void {
            $got = shardian('ab', [
                'dirLetterCount' => 1,
                'dirNestDepth' => 4,
                'insufficientChars' => 'warn',
            ]);
        });

        $this->assertSame('/a/b/ab', $got);
        $this->assertCount(1, $warnings);
        $this->assertStringContainsString('requested depth 4', $warnings[0]);
    }

    public function testDotfileIsAllowed(): void
    {
        $warnings = $this->captureWarnings(function () use (&$got): void {
            $got = shardian('.gitignore');
        });

        $this->assertSame('/./g/i/t/.gitignore', $got);
        $this->assertSame([], $warnings);
    }

    public function testExtensionOnlyListFullyReplacesDefault(): void
    {
        $got = shardian('.jpg', ['extensionOnlyList' => ['.custom']]);

        $this->assertSame('/./j/p/g/.jpg', $got);
    }

    public function testEmptyFileNameThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('');
    }

    public function testForwardSlashThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('dir/a.jpg');
    }

    public function testBackslashThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('dir\\a.jpg');
    }

    public function testDirLetterCountZeroThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('abc.jpg', ['dirLetterCount' => 0]);
    }

    public function testDirNestDepthZeroThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('abc.jpg', ['dirNestDepth' => 0]);
    }

    public function testInsufficientCharsThrowThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('ab', [
            'dirLetterCount' => 1,
            'dirNestDepth' => 4,
            'insufficientChars' => 'throw',
        ]);
    }

    public function testDotThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('.');
    }

    public function testDotDotThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('..');
    }

    public function testDotSlashThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('./');
    }

    public function testDotDotSlashThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('../');
    }

    public function testExtensionOnlyThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('.jpg');
    }

    public function testExtensionOnlyCaseInsensitiveThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('.JPG');
    }

    public function testCustomExtensionOnlyListMatchThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('.custom', ['extensionOnlyList' => ['.custom']]);
    }

    public function testEmptyExtensionOnlyListFallsBackToCommonExtensions(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('.jpg', ['extensionOnlyList' => []]);
    }

    public function testExtensionOnlyListMissingDotThrows(): void
    {
        $this->expectException(InvalidArgumentException::class);
        shardian('a.jpg', ['extensionOnlyList' => ['jpg']]);
    }

    /**
     * @param callable(): void $fn
     *
     * @return list<string>
     */
    private function captureWarnings(callable $fn): array
    {
        $warnings = [];
        set_error_handler(static function (int $severity, string $message) use (&$warnings): bool {
            if ($severity === E_USER_WARNING) {
                $warnings[] = $message;

                return true;
            }

            return false;
        });

        try {
            $fn();
        } finally {
            restore_error_handler();
        }

        return $warnings;
    }
}
