#!/bin/bash

suggestions=$(cat suggestions.txt)
letters=(e r r o f m l e a p c i a m a r a t t r s e n)

for suggestion in "$suggestions"; do
    curr_suggestion="$suggestion"
    declare -a curr_suggestions_arr
    for letter in $(grep -o . <<< "$suggestion"); do
        
        
        
    done
done

