function refresh(){
    var text = $("#editor").val().replace(/\n/g, '<br/>\n');
    text = text.split(/\n/g);
    for(var i=0;i<text.length;i++){
        if(text[i].charAt(0)=="#"){
            var j=1;
            for(;j<6;j++){
                if(text[i].charAt(j)!="#"){break;}
            }
            text[i]="<h"+j+">"+text[i].substr(j)+"</h"+j+">";
        }
    }
    $("#render").html(text);
}