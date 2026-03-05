class Forge < Formula
  desc "Project orchestration for Claude Code, backed by beads"
  homepage "https://github.com/MonsieurBarti/forge"
  url "https://github.com/MonsieurBarti/forge/archive/refs/tags/v0.1.0.tar.gz"
  sha256 ""
  license "MIT"

  depends_on "node"

  def install
    libexec.install Dir["*"]
    bin.write_exec_script libexec/"install.js"
  end

  def caveats
    <<~EOS
      Run the installer to set up Forge in Claude Code:
        node #{libexec}/install.js
    EOS
  end

  test do
    assert_match "Forge", shell_output("node #{libexec}/install.js --help 2>&1", 1)
  end
end
