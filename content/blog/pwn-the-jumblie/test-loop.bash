#!/bin/bash

letters=(a b c d e f)
numbers=(1 2 3 4 5)

for letter in "${letters[@]}"; do
    echo "$letter"
    for number in "${numbers[@]}"; do
        echo "$number"
        if [ "$letter" = "a" ]; then
            break
        fi
    done
done
