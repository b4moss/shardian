package shardian

import (
	"fmt"
	"log"
	"strings"
)

// InsufficientChars controls behavior when the filename cannot fill DirNestDepth.
type InsufficientChars string

const (
	InsufficientIgnore InsufficientChars = "ignore"
	InsufficientWarn   InsufficientChars = "warn"
	InsufficientThrow  InsufficientChars = "throw"
)

// Option configures Shardian / ShardianSplit.
// Nil pointer fields use defaults (DirLetterCount=1, DirNestDepth=4).
// A non-nil zero for DirLetterCount or DirNestDepth is an error (same as JS).
type Option struct {
	DirLetterCount    *int
	DirNestDepth      *int
	StripHeadSlash    bool
	InsufficientChars InsufficientChars
	ExtensionOnlyList []string
}

// SplitPath is returned by ShardianSplit.
type SplitPath struct {
	FullPath     string
	PathOnly     string
	FileNameOnly string
}

// CommonExtensions is the default extension-only deny list (dot-prefixed).
var CommonExtensions = []string{
	".jpg",
	".jpeg",
	".png",
	".gif",
	".webp",
	".svg",
	".bmp",
	".ico",
	".tif",
	".tiff",
	".heic",
	".avif",
	".mp3",
	".wav",
	".flac",
	".aac",
	".ogg",
	".m4a",
	".wma",
	".mp4",
	".webm",
	".mov",
	".avi",
	".mkv",
	".m4v",
	".wmv",
	".pdf",
	".txt",
	".md",
	".doc",
	".docx",
	".xls",
	".xlsx",
	".ppt",
	".pptx",
	".csv",
	".rtf",
	".odt",
	".ods",
	".odp",
	".zip",
	".tar",
	".gz",
	".tgz",
	".tar.gz",
	".7z",
	".rar",
	".bz2",
	".xz",
	".js",
	".ts",
	".jsx",
	".tsx",
	".json",
	".html",
	".htm",
	".css",
	".scss",
	".xml",
	".yml",
	".yaml",
	".toml",
	".php",
	".py",
	".rb",
	".go",
	".rs",
	".java",
	".c",
	".cpp",
	".h",
	".cs",
	".sh",
	".ttf",
	".otf",
	".woff",
	".woff2",
	".eot",
}

// Shardian builds a sharded path string ending with fileName.
func Shardian(fileName string, opt *Option) (string, error) {
	fullPath, _, err := shardianCore(fileName, opt)
	if err != nil {
		return "", err
	}
	return fullPath, nil
}

// ShardianSplit builds a SplitPath with FullPath, PathOnly, and FileNameOnly.
func ShardianSplit(fileName string, opt *Option) (SplitPath, error) {
	fullPath, pathOnly, err := shardianCore(fileName, opt)
	if err != nil {
		return SplitPath{}, err
	}
	return SplitPath{
		FullPath:     fullPath,
		PathOnly:     pathOnly,
		FileNameOnly: fileName,
	}, nil
}

func shardianCore(fileName string, opt *Option) (fullPath string, pathOnly string, err error) {
	dirLetterCount := 1
	dirNestDepth := 4
	stripHeadSlash := false
	insufficientChars := InsufficientIgnore
	var extensionOnlyList []string

	if opt != nil {
		if opt.DirLetterCount != nil {
			dirLetterCount = *opt.DirLetterCount
		}
		if opt.DirNestDepth != nil {
			dirNestDepth = *opt.DirNestDepth
		}
		stripHeadSlash = opt.StripHeadSlash
		if opt.InsufficientChars != "" {
			insufficientChars = opt.InsufficientChars
		}
		extensionOnlyList = opt.ExtensionOnlyList
	}

	if fileName == "" {
		return "", "", fmt.Errorf("fileName must not be empty")
	}
	if fileName == "." || fileName == ".." || fileName == "./" || fileName == "../" {
		return "", "", fmt.Errorf("fileName must not be a relative path reference")
	}
	if strings.ContainsAny(fileName, "/\\") {
		return "", "", fmt.Errorf("fileName must not contain path separators")
	}
	if dirLetterCount < 1 {
		return "", "", fmt.Errorf("dirLetterCount must be >= 1")
	}
	if dirNestDepth < 1 {
		return "", "", fmt.Errorf("dirNestDepth must be >= 1")
	}

	resolvedExtensionList := CommonExtensions
	if len(extensionOnlyList) > 0 {
		resolvedExtensionList = extensionOnlyList
	}

	for _, ext := range resolvedExtensionList {
		if !strings.HasPrefix(ext, ".") {
			return "", "", fmt.Errorf("extensionOnlyList entries must start with '.': received %s", ext)
		}
	}

	lowerName := strings.ToLower(fileName)
	for _, ext := range resolvedExtensionList {
		if lowerName == strings.ToLower(ext) {
			return "", "", fmt.Errorf("fileName must not be extension-only: %s", fileName)
		}
	}

	chars := []rune(fileName)
	segments := make([]string, 0, dirNestDepth)
	offset := 0

	for i := 0; i < dirNestDepth; i++ {
		if len(chars)-offset < dirLetterCount {
			break
		}
		segments = append(segments, string(chars[offset:offset+dirLetterCount]))
		offset += dirLetterCount
	}

	if len(segments) < dirNestDepth {
		msg := fmt.Sprintf(
			"shardian: requested depth %d but only %d segment(s) for fileName=%s",
			dirNestDepth,
			len(segments),
			fileName,
		)
		switch insufficientChars {
		case InsufficientThrow:
			return "", "", fmt.Errorf("%s", msg)
		case InsufficientWarn:
			log.Print(msg)
		}
	}

	fullPath, pathOnly = assemblePaths(segments, fileName, stripHeadSlash)
	return fullPath, pathOnly, nil
}

func assemblePaths(segments []string, fileName string, stripHeadSlash bool) (fullPath string, pathOnly string) {
	if len(segments) == 0 {
		if stripHeadSlash {
			return fileName, ""
		}
		return "/" + fileName, "/"
	}

	body := strings.Join(segments, "/")
	if stripHeadSlash {
		return body + "/" + fileName, body + "/"
	}
	return "/" + body + "/" + fileName, "/" + body + "/"
}
