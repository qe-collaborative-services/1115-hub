sudo apt-get -qq update && sudo apt-get install -qq -y curl wget
curl -fsSL https://raw.githubusercontent.com/sigoden/upt/main/install.sh | sudo sh -s -- --to /usr/local/bin
sudo upt install -y unzip git git-extras libatomic1 jq
curl -Ssf https://pkgx.sh | sh
pkgx install fishshell.com deno.land eget direnv.net crates.io/zoxide crates.io/exa github.com/gopasspw/gopass
echo "$HOME/.local/bin/fish" | sudo tee -a /etc/shells
sh -c "$(curl -fsLS get.chezmoi.io/lb)" -- init strategy-coach/workspaces-host
