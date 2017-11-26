function isEmpty(str) {
    if (str == "" || str == "<br/>") {
        return true;
    } else {
        return false;
    }
}

function processing(text, wholeText_, start, end) {
    var title = "", code = false, strong, em, href, img,hrefr,rl;
    var ulist = false, olist = false, list = false;//refer to    List contains paragraph Feature
    for (var i = start; i <= end; i++) {
        //Some disgust code to end list
        if (list) {//variable list refer to that there is indent in following lines so </li> shouldn't be placed
            if (text[i - 1] == "<br/>" && !(isEmpty(text[i]) || text[i].match(/^\s{4}./))) {
                list = false;
                text[i - 1] = text[i - 1] + "</li>";
            }
        }
        //add </ul></ol> when next line isn't in list and has <ul><ol> above
        if (!list && ulist && !text[i].match(/^\*[ ]/)) {
            ulist = false;
            text[i - 1] = text[i - 1] + "</ul>";
        }
        if (!list && olist && !text[i].match(/^[0-9]\./)) {
            olist = false;
            text[i - 1] = text[i - 1] + "</ol>";
        }

        // > blackquote
        if (text[i].match(/^>/)) {
            var j = i;
            while (j < text.length && text[j].match(/^>/)) {
                text[j] = text[j].substr(1);//delete the first > character
                j++;
            }//determine to which line has the blackquote
            processing(text, wholeText_, i, --j);//all the lines between i and --j are origin lines without the first > character
            text[i] = "<blockquote>" + text[i];
            text[j] = text[j] + "</blockquote>";
            i = j;
            continue;
        }
        // > blackquote

        // ' code
        if (code) {//if there is <code> above
            if (!text[i].match(/^[ ]{4}/)) {//if this line has no indent or something else
                text[i] = text[i] + "</code></pre>";
                code = false;
            } else {
                text[i] = text[i].substr(4) + "<br/>";
            }
            continue;//skip the loop   doesn't change anything in <code>
        }
        if (!list && text[i].match(/^[ ]{4}/)) {//can be rewritten as !code&&text[i].match(/[ ]{4}/)
            //adding !list&& to avoid <code> in list
            if (!code) {//if this line was indented and there is no <code> above
                text[i] = "<pre><code>" + text[i].substr(4) + "<br/>";
            }
            code = true;
            continue;
        }
        // ' code

        // # Title
        title = text[i].match(/^#{1,6}/);
        if (title) {
            text[i] = text[i].replace(/#{1,6}/, "<h" + title.length + ">") + "</h" + title.length + ">";
        }
        if (text[i].match(/^=+/)) {
            if (i - 1 >= start) { text[i - 1] = "<h1>" + text[i - 1] + "</h1>"; text[i] = ""; continue; }
        }
        if (text[i].match(/^-+/)) {
            if (i - 1 >= start && (!isEmpty(text[i - 1]))) { text[i - 1] = "<h2>" + text[i - 1] + "</h2>"; text[i] = ""; continue; }
        }
        // # Title

        // *** dividing line
        if (text[i].match(/^(\*+[ ]*?){3,}/) || text[i].match(/^(\-+[ ]*?){3,}/)) {
            text[i] = "<hr>";
            continue;
        }
        // *** dividing line

        // */[0-9]. list
        if (text[i].match(/^\*[ ]/) || text[i].match(/^[0-9]\./)) {
            //if there is no <ul><ol> above add <ul><ol>
            if (ulist) {
                text[i] = text[i].replace(/^\*[ ]/, "<li>");
            }
            else if (olist) {
                text[i] = text[i].replace(/^[0-9]\./, "<li>");
            } else {
                if (text[i].match(/^\*[ ]/)) {
                    text[i] = "<ul>" + text[i].replace(/^\*[ ]/, "<li>");
                    ulist = true;
                } else {
                    text[i] = "<ol>" + text[i].replace(/^[0-9]\./, "<li>");
                    olist = true;
                }
            }
            /* List contains paragraph Feature

             *   This is a list item with two paragraphs.

             This is the second paragraph in the list item. You're
             only required to indent the first line. Lorem ipsum dolor
             sit amet, consectetuer adipiscing elit.

             *   Another item in the same list.

             The following code enables gramma above.
             Variable list shows whether there are more lines in this list
             */
            var j = i; list = true;
            if (isEmpty(text[i + 1])) {//*words\nwords
                while (j < text.length - 1) {//traverse until the line is indented, then set list=true
                    if (isEmpty(text[j + 1])) {//*words\n\nwords
                        j++;
                    }
                    else {
                        if (!text[j + 1].match(/^\s{4}./)) list = false;//line starts without indent
                        if (text[i + 1].match(/^\*[ ]/) || text[i + 1].match(/^[0-9]\./)) list = false;//line starts without * or [0-9]\.
                        break;
                        //if line starts with indent or */[0-9] then list=true
                    }
                }
            }
            //Feature List contains paragraph end here
            if (list == false || i == text.length - 1) {
                text[i] = text[i] + "</li>";//Add </li> in the end
            }
            // */[0-9]. list

        }

        // * strong
        strong = text[i].match(/\*\*[^*]+?\*\*/);
        if (strong) {
            for (var j = 0; j < strong.length; j++) {
                text[i] = text[i].replace(strong[j], "<b>" + strong[j].substr(2, strong[j].length - 4) + "</b>")
            }
        }
        // * strong

        // * emphasize
        // while(text[i].match(/\*.*?\*/)){
        //     text[i] = text[i].replace(/(?=\*).*?(?=\*)/,"<em>$&</em>");
        // }
        em = text[i].match(/\*[^*]+?\*/g);
        if (em) {
            for (var j = 0; j < em.length; j++) {
                text[i] = text[i].replace(em[j], "<em>" + em[j].substr(1, em[j].length - 2) + "</em>")
            }
        }
        // * emphasize

        // []() href
        href = text[i].match(/\!*\[.*?\]\(.*?\)/)
        if (href) {
            var link, text_, title;
            for (var j = 0; j < href.length; j++) {
                //if(href[j].charAt(0)=="!"){href[j]=href[j].substr(1);}
                link = href[j].match(/\(.*?\)/);
                link = link[0].substr(1, link[0].length - 2);
                text_ = href[j].match(/\[.*?\]/);
                text_ = text_[0].substr(1, text_[0].length - 2);
                title = link.substr(link.indexOf(" ")).match(/".*?"/);
                if (title) {
                    link = link.substr(0, link.indexOf(" "));
                    title = title[0];
                    text[i] = text[i].replace(href[j], "<a href=" + link + " title=" + title + ">" + text_ + "</a>");
                } else {
                    text[i] = text[i].replace(href[j], "<a href=" + link + ">" + text_ + "</a>");
                }
            }
        }
        // []() href

        //[]: reference link
        rl=text[i].match(/(^\[.+\]\:)(.+)/);
        if (rl){
            var link,name_a,name="",title="",title_a=null,sec;

            name_a=rl[1].match(/[^\[\]\:]/g);
            for (var j=0;j<name_a.length;j++){
                name+=name_a[j];
            }
            link=rl[2];
            sec=link.match(/\(.*\)/);
            if (sec){
                title_a=sec[0].match(/[^\(\)]/g);
                link=link.substring(0,sec.index);
            }
            if (title_a){
                for (var j=0;j<title_a.length;j++){
                    title+=title_a[j];
                }
            }
            dic[name]=[link,title];
            text[i]="";
        }
        //[]: reference link

        if (isEmpty(text[i])) { text[i] = text[i] + "<br/>"; }//whether this line is empty add </br>
    }
    if (ulist) { text[end] = text[end] + "</ul>"; }
    if (olist) { text[end] = text[end] + "</ol>"; }
    if(start==0&&end==text.length-1){
        var wholeText = "";
        for (var i = 0; i < text.length; i++) {
            wholeText += text[i];
        }
        //[][] href
        var hrefr = wholeText.match(/(\[.+?\])+?(\[.*?\])+?/);
        while (hrefr) {
            var link="",text_="",sec,start,textrp,text_a,link_a,idx;
            start=hrefr[0];
            //idx=hrefr[0].match(/\[.+\]/).index;
            text_a=hrefr[1].match(/[^\[\]]/g);
            for (var i=0;i<text_a.length;i++){
                text_+=text_a[i];
            }
            link_a=hrefr[2].match(/[^\[\]]/g);
            if (link_a){
                for (var i=0;i<link_a.length;i++){
                    link+=link_a[i];
                }
            }
            if (link !== ""){  //[text][name]
                if (dic[link]=== undefined){  //no name
                    wholeText_+=wholeText.substring(0,hrefr.index+hrefr[0].length);

                }
                else{  //has name
                    if (dic[link][1]===""){  //no title
                        textrp=wholeText.substring(0,hrefr.index+hrefr[0].length);
                        textrp=textrp.replace(start,"<a href=" +dic[link][0] +">" + text_ + "</a>");
                        wholeText_+=textrp;

                    }
                    else{  //has title
                        textrp=wholeText.substring(0,hrefr.index+hrefr[0].length);
                        textrp=textrp.replace(start,"<a href=" +dic[link][0] + " title=" + dic[link][1] +">" + text_ + "</a>");
                        wholeText_+=textrp;

                    }
                }
            }
            else{ //[name][]
                if ($scope.dic[text_]=== undefined){  //no name
                    wholeText_+=wholeText.substring(0,hrefr.index+hrefr[0].length);
                }
                else{ //has name
                    if ($scope.dic[text_][1]===""){  //no title
                        textrp=wholeText.substring(0,hrefr.index+hrefr[0].length);
                        textrp=textrp.replace(start,"<a href=" +$scope.dic[text_][0] +">" + text_ + "</a>");
                        wholeText_+=textrp;
                    }
                    else{  //has title
                        textrp=wholeText.substring(0,hrefr.index+hrefr[0].length);
                        textrp=textrp.replace(start,"<a href=" +$scope.dic[text_][0] + " title=" + $scope.dic[text_][1] +">" + text_ + "</a>");
                        wholeText_+=textrp;
                    }
                }
            }
            wholeText=wholeText.substring(hrefr.index+ hrefr[0].length,wholeText.length);
            hrefr = wholeText.match(/(\[.+?\])+?(\[.*?\])+?/);
        }
        wholeText_ += wholeText;
        return wholeText_;
    }
}