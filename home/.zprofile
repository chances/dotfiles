
export ZSH="$HOME/.oh-my-zsh"

export PATH="$HOME/.local/bin:$PATH"
export PATH="$HOME/.cargo/bin:$PATH"

# Preferred editor for local and remote sessions
if [[ -n $SSH_CONNECTION ]]; then
  export EDITOR='vim'
else
  if [ "$(uname -s)" = "Linux" ]; then
    export EDITOR='io.elementary.code'
  elif [ "$(uname -s)" = "Darwin" ]; then
    export EDITOR='code'
  fi
fi

# Use .envrc for augmenting environment variables per project
# https://direnv.net/
#
# See ~/.envrc
#
# DO NOT EDIT!
