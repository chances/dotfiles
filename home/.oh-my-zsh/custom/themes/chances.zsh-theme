# TODO: A prompt that shows the machine name on SSH connections

# Reference:
# https://github.com/ohmyzsh/ohmyzsh/wiki/Themes#blinks
# https://github.com/ohmyzsh/ohmyzsh/blob/master/themes/blinks.zsh-theme

MACHINE=''
if [[ -n $SSH_CONNECTION ]]; then
  MACHINE=' %{$fg[cyan]%}@%m '
  export PS1=''
fi

PROMPT="%(?:%{$fg_bold[green]%}➜ :%{$fg_bold[red]%}➜ )"
PROMPT+="$MACHINE %{$fg[cyan]%}%c%{$reset_color%} $(git_prompt_info)"

ZSH_THEME_GIT_PROMPT_PREFIX="%{$fg_bold[blue]%}git:(%{$fg[red]%}"
ZSH_THEME_GIT_PROMPT_SUFFIX="%{$reset_color%} "
ZSH_THEME_GIT_PROMPT_DIRTY="%{$fg[blue]%}) %{$fg[yellow]%}✗"
ZSH_THEME_GIT_PROMPT_CLEAN="%{$fg[blue]%})"
