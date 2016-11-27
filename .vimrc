" the vimrc is where we configure our editor
" this guy has some great thoughts on the matter:
" http://mislav.uniqpath.com/2011/12/vim-revisited/
" look into colorschemes, pluggins, package managers for your plugins

execute pathogen#infect()

"" Airline (vim-airline)
let g:airline_powerline_fonts=1
set noshowmode
set laststatus=2
set timeoutlen=50

"" Airline Font Override


"" Basics
colorscheme desert              " use an appealing and bright color set
syntax on                       " colorize code based on syntax highlihgting
set nocompatible                " choose no compatibility with legacy vi
set encoding=utf-8              " utf8 is an encoding, set it
set showcmd                     " display incomplete commands
filetype plugin indent on       " load file type plugins + indentation
set number                      " keep number lines on the right side
                                " bonus: ask basil about her vim line numbers

filetype plugin indent on

"" Whitespace
set nowrap                      " don't wrap lines
set backspace=indent,eol,start  " backspace through everything in insert mode

"" Code Folding
set foldmethod=manual

"" Tabbing (Firefox-like)
"nnoremap <C-S-tab> :tabprevious<CR>
"nnoremap <C-tab>   :tabnext<CR>
"nnoremap <C-t>     :tabnew<CR>
"nnoremap <C-w>     :tabclose<CR>
"inoremap <C-S-tab> <Esc>:tabprevious<CR>i
"inoremap <C-tab>   <Esc>:tabnext<CR>i
"inoremap <C-t>     <Esc>:tabnew<CR>i
"inoremap <C-w>     <ESC>:tabclose<CR>i

" the next set is for tabs vs spaces
" tabs vs spaces is one of the computing holy wars
" also under contention is the number of spaces in a tab

"python/bash mode
set expandtab                   "don't uses spaces ever, a tab key is a jump of spaces
set tabstop=4                   "tabs are 4 spaces (:help tabstop)
set shiftwidth=4                "tabs are 4 spaces (:help shiftwidth)


"ruby/puppet mode
"set expandtab                  "don't uses spaces ever, a tab key is a jump of spaces
"set tabstop=2                  "tabs are 4 spaces (:help tabstop)
"set shiftwidth=2               "tabs are 4 spaces (:help shiftwidth)



"" Searching
set hlsearch                    " highlight matches
set incsearch                   " incremental searching
set ignorecase                  " searches are case insensitive...
set smartcase                   " ... unless they contain at least one capital letter

"" Auomatically open QuickFix window on make errors
autocmd QuickFixCmdPost [^l]* nested cwindow
autocmd QuickFixCmdPost    l* nested lwindow
