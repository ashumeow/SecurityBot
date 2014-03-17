mkdir -p public/lib
curl --fail https://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min.js \
    > public/lib/jquery.min.js
curl --fail https://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.js \
    > public/lib/jquery.js
curl --fail https://cdnjs.cloudflare.com/ajax/libs/jquery/1.10.2/jquery.min.map \
    > public/lib/jquery.min.map
curl --fail https://cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.10.2/dropbox.min.js \
      > public/lib/dropbox.min.js
curl --fail https://cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.10.2/dropbox.js \
      > public/lib/dropbox.js
curl --fail https://cdnjs.cloudflare.com/ajax/libs/dropbox.js/0.10.2/dropbox.min.map \
      > public/lib/dropbox.min.map
