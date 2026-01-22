function jjdesc
  set -l header_line (grep -n "end header" DEVELOPERBLOG.md | head -n 1 | cut -d: -f1)
  set -l mark_line (grep -n "git push" DEVELOPERBLOG.md | head -n 1 | cut -d: -f1)

  set -l start (math $header_line + 1)
  set -l end (math $mark_line - 1)

  set -l new_content (sed -n "$start,$end"p DEVELOPERBLOG.md | sed '1,2{/^[-]*$/d;}' | sed '1,2{/^[[:space:]]*$/d;}' | string collect -N)

  echo "$new_content" > jj_desc.tmp
end


function jj2
    # 1. Zeilennummern der Marker finden
    set -l header_line (grep -n "end header" DEVELOPERBLOG.md | head -n 1 | cut -d: -f1)
    set -l mark_line (grep -n "git push" DEVELOPERBLOG.md | head -n 1 | cut -d: -f1)

    if test -n "$header_line"; and test -n "$mark_line"
        # 2. Den neuen Content zwischen den Markern extrahieren
        # (Startet eine Zeile nach dem Header, ende eine Zeile vor der Marke)
        set -l start (math $header_line + 1)
        set -l end (math $mark_line - 1)
        
        set -l new_content (sed -n "$start,$end"p DEVELOPERBLOG.md | sed '1,2{/^[-]*$/d;}' | sed '1,2{/^[[:space:]]*$/d;}' | string collect -N)

        if test -n "$new_content"
            # 3. Den Content als JJ Beschreibung setzen
            echo "$new_content" > jj_desc.tmp
            jj describe -m "$new_content"

            # 4. Datei neu zusammenbauen
            set -l timestamp (date "+%d.%m.%Y %H:%M")
            
            # Alles bis zum Header-Ende (inklusive Marker) bewahren
            sed -n "1,$header_line"p DEVELOPERBLOG.md > DEVELOPERBLOG.tmp
            
            # Neue Marke einfügen (für den nächsten Durchgang)
            echo -e " "   >> DEVELOPERBLOG.tmp
            echo -e "---" >> DEVELOPERBLOG.tmp
            echo -e "<sup><sub> git push - $timestamp </sub></sup><br/>" >> DEVELOPERBLOG.tmp
            echo -e $new_content >> DEVELOPERBLOG.tmp
            
            # Alles ab der alten Marke (Archiv) anhängen
            tail -n +$mark_line DEVELOPERBLOG.md >> DEVELOPERBLOG.tmp
            
            #mv DEVELOPERBLOG.tmp DEVELOPERBLOG.md 

            # 5. JJ Workflow
            jj bookmark set main -r @
            jj git push
            jj new main
            jj status && jj log

            echo "JJ2: Erfolg: Log archiviert."
        else
            echo "JJ2: Nichts neues zum Loggen gefunden."
        end
    else
        echo "JJ2: Fehler - Marker 'end header' oder 'git push' fehlen!"
    end
end
