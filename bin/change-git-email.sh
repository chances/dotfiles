#!/bin/sh
 
git filter-branch --env-filter '

OLD_EMAIL="chances@cat.pdx.edu"
CORRECT_NAME=`git config --global user.name`
CORRECT_EMAIL=`git config --global user.email`

if [ "$GIT_COMMITTER_EMAIL" = "$OLD_EMAIL" ]
then
        export GIT_COMMITTER_NAME="$CORRECT_NAME"
            export GIT_COMMITTER_EMAIL="$CORRECT_EMAIL"
        fi
        if [ "$GIT_AUTHOR_EMAIL" = "$OLD_EMAIL" ]
        then
                export GIT_AUTHOR_NAME="$CORRECT_NAME"
                    export GIT_AUTHOR_EMAIL="$CORRECT_EMAIL"
                fi
                ' --tag-name-filter cat -- --branches --tags
