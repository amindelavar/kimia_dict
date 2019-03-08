
//********************public variables
var version = "1.5";
var bold = ["[b]", "[/b]"];
var italic = ["[i]", "[/i]"];
var underline = ["[u]", "[/u]"];
var btn_ids = ["bold_btn", "italic_btn", "underline_btn"];
var is_has_intro = false;
//********************


//----------------------------------------------------------------------------
//----------------------------------------------------------------------------
function set_editor_tags(open_tag, close_tag)
{
    var doc_edit = document.getElementById(doc);
    var start = doc_edit.selectionStart;
    var end = doc_edit.selectionEnd;
    if (start === end)
    {
        start = 0;
    }
    var before = doc_edit.value.substr(0, start);
    var select = doc_edit.value.substr(start, end - start);
    var after = doc_edit.value.substr(end);
//***************
    doc_edit.value = before + open_tag + select + close_tag + after;
    //alert("gh:"+before+","+select+","+after);

}

//----------------------------------------------------------------------------
function  set_editor_codes()
{

    var s1 = "شما می توانید کد های خود را در قالب زبان های برنامه نویسی لیست شده در زیر بنویسید:";
    //*********************
    /*
     * markup+css+clike+javascript+apacheconf+aspnet+basic+c+csharp+cpp+ruby+fsharp+fortran+go+groovy+http+java+livescript+makefile+matlab+nasm+objectivec+pascal+perl+php+php-extras+powershell+prolog+python+r+scala+smalltalk+sql+swift+vbnet
     */
    var s2 = "<p>\
    لیست زبان های برنامه نویسی پشتیبانی شده :\
    &nbsp;&nbsp;\
<select id='prog_list'>\
    <option value='c'>C</option>\n\
    <option value='cpp'>C++</option>\n\
    <option value='css'>CSS</option>\n\
    <option value='javascript'>JavaScript</option>\n\
    <option value='csharp'>C#</option>\n\
    <option value='php'>PHP</option>\n\
    <option value='markup'>HTML</option>\n\
    <option value='python'>Python</option>\n\
    <option value='java'>JAVA</option>\n\
    <option value='go'>GO</option>\n\
  </select>\
";
    //*********************defualt code
    var con = "\
/*Write your code here...*/ \n\
int main\n\
{\n\
\treturn 0;\n\
}\
";
    var s3 = "<textarea id='doc_codes' class='code_editor'>" + con + "</textarea>";
    //*********************
    var title = "افزودن کد";
    var body = s1 + "<br>" + s2 + "<br>" + s3;
    var footer = "<p><button class='btn_std' id='submit_code'>افزودن کد</button></p>";

    modal_settings("on", title, body, footer);
    //*********************
    $("#submit_code").click(function ()
    {
        var type_p = "^^" + $("#prog_list").val();
        var txt = type_p + "\n" + $("#doc_codes").val().trim() + "\n" + type_p;
        //************
        var tmp = document.getElementById(doc);
        var start = tmp.selectionStart;
        var before = tmp.value.substr(0, start);
        var after = tmp.value.substr(start);
        if (before[before.length - 1] != '\n')
            txt = '\n' + txt;
        if (after[0] != '\n')
            txt += '\n';
        tmp.value = before + txt + after;
        modal_settings("save");
        //alert(pos);
    });

}
//----------------------------------------------------------------------------
function set_editor_headers()
{
    var title = "افزودن سر تیتر";
    var s1 = "لطفا نام سر تیتری که می خواهید را وارد کنید:";
    //*********************
    var s2 = "<p><input type='text' id='header_edit' class='txt_input' />\
&nbsp;&nbsp;&nbsp;\
<button class='btn_std' id='submit_header'>افزودن سر تیتر</button></p>";
    //*********************
    if (!is_has_intro)
    {
        s1 += "<b style='color:red;font-size:12px;'>" + " (مقاله شما فاقد سرتیتر مقدمه می باشد.)" + "</b>";
    }
    var body = s1 + "" + s2;
    modal_settings("on", title, body, "");
    if (!is_has_intro)
    {
        $("#header_edit").val("introduction");
    }
    //*********************
    $("#submit_header").click(function ()
    {
        var txt = $("#header_edit").val();
        txt = "%" + txt.trim() + "%";
        var tmp = document.getElementById(doc);
        var start = tmp.selectionStart;
        var before = tmp.value.substr(0, start);
        var after = tmp.value.substr(start);
        if (before[before.length - 1] != '\n')
            txt = '\n' + txt;
        if (after[0] != '\n')
            txt += '\n';
        tmp.value = before + txt + after;
        modal_settings("save");
        //alert(pos);
    });
    //*********************

}


   //----------------------------------------------------------------------------
    function editor_info()
    {
        var html_body="\
  <b>\
  ویرایشگر ویکی رایانه (" + version + ")</b>\
  <br>\
  این ویرایشگر ، یک ویرایشگر متن باز و رایگان است که به سفارش ویکی رایانه ساخته شده است. \
  <br> \
  در حال حاضر این ویرایشگر را می توانید از سرور های ویکی رایانه به صورت رایگان دریافت کنید.\
  ";
        modal_settings("on","درباره ویرایشگر",html_body,"");
    }
//----------------------------------------------------------------------------
    function escapeHtml(text) {
        var map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };

        return text.replace(/[&<>"']/g, function (m) {
            return map[m];
        });
    }

