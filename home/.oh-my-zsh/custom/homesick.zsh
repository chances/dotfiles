# Bootstrap Homesick (https://github.com/andsens/homeshick)
HOMESICK=$HOME/.homesick/repos/homeshick
if [ -d "$HOMESICK" ]; then
  source "$HOMESICK/homeshick.sh"
  homesick() {
    homeshick "$@"
  }

  # Zsh completion
  fpath=($HOMESICK/completions $fpath)
fi
