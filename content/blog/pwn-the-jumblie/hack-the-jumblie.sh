#!/bin/bash

# jumblie.com
# tu tem um conjunto de 20 a 30 letras. que podem ser repetidas
# existem **4 palavras** que devem ser encontradas com combinações dessas letras
# cada palavra tem de 4 a 9 letras
# cada letra só pode ser usada uma única vez
# como tu faria pra listar palavras potenciais?
# a ideia é não olhar o fonte do jogo né, pq deve ter a lógica que gera as palavras, daí perde a graça


# TODO: get letters from the url
letters=(e r r o f m l e a p c i a m a r a t t r s e n)
unique_letters=($(echo "${letters[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' '))
all_letters=(a b c d e f g h i j k l m n o p q r s t u v w x y z)

# adapted from https://stackoverflow.com/a/28161520/14427854
unwanted_letters=($(echo "${letters[@]}" "${all_letters[@]}" | tr ' ' '\n' | sort | uniq -u | tr '\n' ' '))

en_dict=american-english
word_bag=$(cat "$en_dict" | tr '[:upper:]' '[:lower:]' | sort -u | grep -v \'s | sed "/.\{10\}/d" | sed '/.\{4\}/!d')

# remove words with unwanted letters
for unwanted_letter in "${unwanted_letters[@]}"; do
    word_bag=$(echo "$word_bag" | grep -v -i "$unwanted_letter")
done

filtered_bag=$(echo "$word_bag")

for word in $word_bag; do
    for letter in "${unique_letters[@]}"; do 
        qtt_in_word=$(grep -o . <<< "$word" | grep -c "$letter")
        qtt_available=$(grep -o . <<< "${letters[@]}" | grep -c "$letter")
        if [ "$qtt_in_word" -gt "$qtt_available" ]; then
            filtered_bag=$(echo "$filtered_bag" | grep -v "^$word$")
            break
        fi
    done
done

# there is some way I can calculate if, thanks to the number of available letters
# and the number of letters in each word, what combinations are valid
# for the list of $filtered_bag, which groups of four words can be combined
# to a sum of exactly N letters, using all available letters?

echo "$filtered_bag" | tr '[:upper:]' '[:lower:]' | sort
