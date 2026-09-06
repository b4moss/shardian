package shardian

import (
	"bytes"
	"log"
	"strings"
	"testing"
)

func p(n int) *int {
	return &n
}

func captureLog(t *testing.T, fn func()) string {
	t.Helper()
	var buf bytes.Buffer
	prev := log.Writer()
	prevFlags := log.Flags()
	prevPrefix := log.Prefix()
	log.SetOutput(&buf)
	log.SetFlags(0)
	log.SetPrefix("")
	defer func() {
		log.SetOutput(prev)
		log.SetFlags(prevFlags)
		log.SetPrefix(prevPrefix)
	}()
	fn()
	return buf.String()
}

func TestShardianNormalCases(t *testing.T) {
	t.Run("builds full path with defaults and no warn", func(t *testing.T) {
		out := captureLog(t, func() {
			got, err := Shardian("abc1234.jpg", nil)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != "/a/b/c/1/abc1234.jpg" {
				t.Fatalf("got %q", got)
			}
		})
		if out != "" {
			t.Fatalf("expected no warn, got %q", out)
		}
	})

	t.Run("builds two-char segments without warn", func(t *testing.T) {
		out := captureLog(t, func() {
			got, err := Shardian("abcdef", &Option{
				DirLetterCount: p(2),
				DirNestDepth:   p(2),
			})
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != "/ab/cd/abcdef" {
				t.Fatalf("got %q", got)
			}
		})
		if out != "" {
			t.Fatalf("expected no warn, got %q", out)
		}
	})

	t.Run("strips head slash when StripHeadSlash is true", func(t *testing.T) {
		out := captureLog(t, func() {
			got, err := Shardian("abc1234.jpg", &Option{StripHeadSlash: true})
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != "a/b/c/1/abc1234.jpg" {
				t.Fatalf("got %q", got)
			}
		})
		if out != "" {
			t.Fatalf("expected no warn, got %q", out)
		}
	})

	t.Run("returns split path from ShardianSplit", func(t *testing.T) {
		out := captureLog(t, func() {
			got, err := ShardianSplit("abc1234.jpg", nil)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			want := SplitPath{
				FullPath:     "/a/b/c/1/abc1234.jpg",
				PathOnly:     "/a/b/c/1/",
				FileNameOnly: "abc1234.jpg",
			}
			if got != want {
				t.Fatalf("got %+v, want %+v", got, want)
			}
		})
		if out != "" {
			t.Fatalf("expected no warn, got %q", out)
		}
	})

	t.Run("strips head slash on FullPath and PathOnly when split", func(t *testing.T) {
		got, err := ShardianSplit("abc1234.jpg", &Option{StripHeadSlash: true})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		want := SplitPath{
			FullPath:     "a/b/c/1/abc1234.jpg",
			PathOnly:     "a/b/c/1/",
			FileNameOnly: "abc1234.jpg",
		}
		if got != want {
			t.Fatalf("got %+v, want %+v", got, want)
		}
	})

	t.Run("short name with zero segments returns filename path", func(t *testing.T) {
		out := captureLog(t, func() {
			got, err := Shardian("a", &Option{
				DirLetterCount: p(2),
				DirNestDepth:   p(3),
			})
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != "/a" {
				t.Fatalf("got %q", got)
			}
		})
		if out != "" {
			t.Fatalf("expected no warn, got %q", out)
		}
	})

	t.Run("zero segments with StripHeadSlash returns bare filename", func(t *testing.T) {
		got, err := Shardian("a", &Option{
			DirLetterCount: p(2),
			DirNestDepth:   p(3),
			StripHeadSlash: true,
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if got != "a" {
			t.Fatalf("got %q", got)
		}
	})

	t.Run("zero segments split returns root PathOnly", func(t *testing.T) {
		got, err := ShardianSplit("a", &Option{
			DirLetterCount: p(2),
			DirNestDepth:   p(3),
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		want := SplitPath{
			FullPath:     "/a",
			PathOnly:     "/",
			FileNameOnly: "a",
		}
		if got != want {
			t.Fatalf("got %+v, want %+v", got, want)
		}
	})

	t.Run("zero segments split with StripHeadSlash returns empty PathOnly", func(t *testing.T) {
		got, err := ShardianSplit("a", &Option{
			DirLetterCount: p(2),
			DirNestDepth:   p(3),
			StripHeadSlash: true,
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		want := SplitPath{
			FullPath:     "a",
			PathOnly:     "",
			FileNameOnly: "a",
		}
		if got != want {
			t.Fatalf("got %+v, want %+v", got, want)
		}
	})

	t.Run("short name defaults to ignore without warn", func(t *testing.T) {
		out := captureLog(t, func() {
			got, err := Shardian("ab", &Option{
				DirLetterCount: p(1),
				DirNestDepth:   p(4),
			})
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != "/a/b/ab" {
				t.Fatalf("got %q", got)
			}
		})
		if out != "" {
			t.Fatalf("expected no warn, got %q", out)
		}
	})

	t.Run("short name warns when InsufficientChars is warn", func(t *testing.T) {
		var got string
		var err error
		out := captureLog(t, func() {
			got, err = Shardian("ab", &Option{
				DirLetterCount:    p(1),
				DirNestDepth:      p(4),
				InsufficientChars: InsufficientWarn,
			})
		})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if got != "/a/b/ab" {
			t.Fatalf("got %q", got)
		}
		if strings.TrimSpace(out) == "" {
			t.Fatal("expected warn log")
		}
	})

	t.Run("allows dotfile that is not extension-only", func(t *testing.T) {
		out := captureLog(t, func() {
			got, err := Shardian(".gitignore", nil)
			if err != nil {
				t.Fatalf("unexpected error: %v", err)
			}
			if got != "/./g/i/t/.gitignore" {
				t.Fatalf("got %q", got)
			}
		})
		if out != "" {
			t.Fatalf("expected no warn, got %q", out)
		}
	})

	t.Run("ExtensionOnlyList replaces defaults so .jpg is allowed", func(t *testing.T) {
		got, err := Shardian(".jpg", &Option{ExtensionOnlyList: []string{".custom"}})
		if err != nil {
			t.Fatalf("unexpected error: %v", err)
		}
		if got != "/./j/p/g/.jpg" {
			t.Fatalf("got %q", got)
		}
	})
}

func TestShardianErrorCases(t *testing.T) {
	t.Run("empty fileName errors", func(t *testing.T) {
		if _, err := Shardian("", nil); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("fileName with / errors", func(t *testing.T) {
		if _, err := Shardian("dir/a.jpg", nil); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run(`fileName with \ errors`, func(t *testing.T) {
		if _, err := Shardian(`dir\a.jpg`, nil); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("DirLetterCount 0 errors", func(t *testing.T) {
		if _, err := Shardian("abc.jpg", &Option{DirLetterCount: p(0)}); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("DirNestDepth 0 errors", func(t *testing.T) {
		if _, err := Shardian("abc.jpg", &Option{DirNestDepth: p(0)}); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("short name errors when InsufficientChars is throw", func(t *testing.T) {
		if _, err := Shardian("ab", &Option{
			DirLetterCount:    p(1),
			DirNestDepth:      p(4),
			InsufficientChars: InsufficientThrow,
		}); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("dot fileName errors", func(t *testing.T) {
		if _, err := Shardian(".", nil); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("dotdot fileName errors", func(t *testing.T) {
		if _, err := Shardian("..", nil); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("./ fileName errors", func(t *testing.T) {
		if _, err := Shardian("./", nil); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("../ fileName errors", func(t *testing.T) {
		if _, err := Shardian("../", nil); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("extension-only .jpg errors", func(t *testing.T) {
		found := false
		for _, ext := range CommonExtensions {
			if ext == ".jpg" {
				found = true
				break
			}
		}
		if !found {
			t.Fatal("CommonExtensions should include .jpg")
		}
		if _, err := Shardian(".jpg", nil); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("extension-only .JPG errors case-insensitively", func(t *testing.T) {
		if _, err := Shardian(".JPG", nil); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("custom ExtensionOnlyList match errors", func(t *testing.T) {
		if _, err := Shardian(".custom", &Option{ExtensionOnlyList: []string{".custom"}}); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("empty ExtensionOnlyList falls back to CommonExtensions", func(t *testing.T) {
		if _, err := Shardian(".jpg", &Option{ExtensionOnlyList: []string{}}); err == nil {
			t.Fatal("expected error")
		}
	})

	t.Run("ExtensionOnlyList entry without leading dot errors", func(t *testing.T) {
		if _, err := Shardian("a.jpg", &Option{ExtensionOnlyList: []string{"jpg"}}); err == nil {
			t.Fatal("expected error")
		}
	})
}
