const {
    ipcRenderer,
    remote,
    clipboard,
    process
} = require('electron');
const reading_funcs = require('../funcs/reading_funcs');
const data_funcs = require('../funcs/data_funcs');
// console.log(ipcRenderer.sendSync('synchronous-message', 'ping')) // prints "pong "
//---------load basics
var input_lang = "en";
var VERSION = ipcRenderer.sendSync('load_config', 'version');
var slidebar = ipcRenderer.sendSync('load_config', 'toggle_slidebar');
var related_results = parseInt(ipcRenderer.sendSync('load_config', 'max_related_results'), 10);
toggle_slide_bar(slidebar);
//---------load lang
var tmp1 = ipcRenderer.sendSync('load_config', 'lang');
var lang = reading_funcs.load_config_file(`${__dirname}/../langs/${tmp1}.bn`);
//---------load system lang on html
//$("head").append(`<link href="../css/semantic.${lang['dir']}.min.css" rel="stylesheet" type="text/css" />`);
$("body").addClass(lang['dir_cl']);
$("#main_search_input").attr('placeholder', lang['search_prompt']);
change_input_lang(tmp1);
//console.log(lang);
//---------load auto database
var tmp2 = ipcRenderer.sendSync('load_config', 'auto_database');
var auto = reading_funcs.load_database_file(`${__dirname}/../databases/${tmp2}.bnu`);
//---------load allowed database
var allowed_databases = ipcRenderer.sendSync('load_config', 'allowed_databases');
//console.log(auto);
//---------preview dict
start_privewer();

function start_privewer() {
    var ver = VERSION;
    $("head title").html(lang['kimia_des'] + ` (${ver})`);
    $("#main_content").html(`<div style='user-select:none;cursor: default;' class='${tmp1}_style'>
    <center style='margin:20px 0;'><div class='load_large_logo'></div></center>
    <center class='${tmp1}_style'><h1 style="color:#2F4F4F;text-align:center;margin:20px 2%;text-shadow:0 2px 4px rgba(0,0,0,0.2);" class='${tmp1}_style'>${lang['kimia_des']}<sup style="font-size:x-small;">&nbsp;(${lang['version']}&nbsp;${ver})</sup></h1></center>
    <h4 style="margin:0 10px;" class='${tmp1}_style'>${lang['programming']}</h4>
    <b style="font-size:large;padding:5px;color:#00CED1;" class='${tmp1}_style'>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;${lang['programmer_name']}</b>
    <center style="font-size:medium;color:#008B8B;font-weight: bold;line-height:150%;margin:50px 20%;margin-bottom:10px;text-align:center;" >${lang['about_program_2']}</center>
    <center><div style="color:#fff;background-color:#004B8D;font-weight: bold;margin:10px auto;font-size:small;text-align:center;display:inline-block;padding:3px 6px;border-radius:3px;" >${lang['about_program_1']}</div></center>
    </div>`);
    $("#main_search_input").focus();
}
//---------load menu bar
$("#menu_bar").addClass(tmp1 + "_style");

$("#results_tab .header").text(lang['results']).addClass(tmp1 + "_style");
$("#results_tab .menu").html('').addClass(tmp1 + "_style");

$("#options_tab .header").text(lang['options']).addClass(tmp1 + "_style");
$("#options_tab .menu").html(`
    <a class='item disabled'>${lang['configuration']}</a>
    <a class='item disabled'>${lang['manage_dicts']}</a>
    <a class='item disabled'>${lang['share_results']}</a>
    <a class='item' onclick='start_privewer()'>${lang['about_app']}</a>
    <a class='item' onclick='app_exit()'>${lang['exit_app']}</a>
`).addClass(tmp1 + "_style");

function app_exit() {
    remote.app.exit();
}
$("#tools_tab .header").text(lang['tools']).addClass(tmp1 + "_style");
$("#tools_tab .menu").html(`
    <a class='item disabled'>${lang['translate_words_file']}</a>
    <a class='item disabled'>${lang['daily_words']}</a>
    <a class='item disabled'>${lang['add_to_my_dict']}</a>
`).addClass(tmp1 + "_style");
$("#info_tab .header").text(lang['info']).addClass(tmp1 + "_style");
$("#info_tab .menu").html('').addClass(tmp1 + "_style");
//---------change input language
function change_input_lang(det) {
    if (det != null && det != input_lang) {
        console.log("input_lang changed:" + input_lang + "=>" + det);
        $("#main_search_input").removeClass(`${input_lang}_style ${input_lang}_align`);
        input_lang = det;
        $("#main_search_input").addClass(`${input_lang}_style ${input_lang}_align`);
        //console.log(input_lang);         
    }
}
//---------show auto complete
$("#main_search_input").on("keyup keydown keypress", (e) => {
    var text = $("#main_search_input").val();
    //detect text language
    if (e.type == 'keypress') {
        var det = data_funcs.detect_char_language(e);
        change_input_lang(det);
    }
    if (e.type == 'keyup' && e.keyCode == 40 /*down arrow*/ ) {
        var selected = $("#search_results div").filter(".auto_complete_results_div_selected");
        selected.removeClass("auto_complete_results_div_selected");
        if (selected.next().length == 0) {
            $("#search_results div:first").addClass("auto_complete_results_div_selected");
        } else {
            selected.next().addClass("auto_complete_results_div_selected");
        }
        e.preventDefault();

    } else if (e.type == 'keyup' && e.keyCode == 38 /*up arrow*/ ) {
        var selected = $("#search_results div").filter(".auto_complete_results_div_selected");
        selected.removeClass("auto_complete_results_div_selected");
        if (selected.prev().length == 0) {
            $("#search_results div:first").addClass("auto_complete_results_div_selected");
        } else {
            selected.prev().addClass("auto_complete_results_div_selected");
        }
        e.preventDefault();

    } else if (e.type == 'keyup' && e.keyCode == 13 /*enter*/ ) {
        var selected = $("#search_results div").filter(".auto_complete_results_div_selected");
        if (selected.length == 0) {
            search_data(text);
            $(".auto_complete_results").css('display', 'none');
        } else {
            word_searching(selected.text());
        }
        e.preventDefault();

    } else if (e.type == 'keydown' && e.keyCode == 8 /*backspace*/ ) {
        if (text.length < 2) {
            $(".auto_complete_results").css('display', 'none');
        } else {
            autocomplete_search(text);
        }
    } else if (e.type == 'keyup') {
        //text += String.fromCharCode(e.charCode);
        if (text.length > 0) {
            $(".auto_complete_results").css('display', 'block');
        }
        autocomplete_search(text);
    }

});
$(document).click(function(e) {
    if (!$(e.target).parents().is('.auto_complete_results') && $(e.target).attr('id') != 'main_search_input') {
        $(".auto_complete_results").css('display', 'none');
    }

});
//---------search results click event
$("#search_results").on("click", "div", function() {
    $(this).addClass("auto_complete_results_div_selected");
    word_searching($(this).text());
});
//---------auto complete search function
function autocomplete_search(text) {
    var html = "";
    //alert(`@${text}@`);
    var tmp = data_funcs.search_auto_data(auto, text, 20);
    tmp.forEach(element => {
        var tmp2 = element.replace(text, "<span>" + text + "</span>");
        html += "<div>" + tmp2 + "</div>";
    });
    //console.log(html);
    if (html == '') {
        $(".auto_complete_results").css('display', 'none');
    }
    $(".auto_complete_results").html(html);
}
//---------search function
function search_click() {
    if ($("#main_search_input").val().trim() == "") return;
    search_data($("#main_search_input").val());
    $(".auto_complete_results").css('display', 'none');
}

function word_searching(word) {
    $("#main_search_input").val(word);
    search_click();
}
//---------toggle slide bar
function toggle_slide_bar(wh) {
    if (wh == 'close' || wh == 'open' || (wh == 'toggle' && $("#menu_bar").css('display') === 'block')) {
        $("#content_bar").removeClass('twelve wide column');
        $("#main_dict").removeClass('ui four column grid');
        $("#menu_bar").css('display', 'none');
        $("#toggle_slider i").removeClass('blue');
        if (wh == 'toggle') return;
    }
    if (wh == 'open' || (wh == 'toggle' && $("#menu_bar").css('display') === 'none')) {
        $("#content_bar").addClass('twelve wide column');
        $("#main_dict").addClass('ui four column grid');
        $("#menu_bar").fadeIn();
        $("#toggle_slider i").addClass('blue');
    }
}
$(window).resize(function() {
    if ($("#menu_bar").css('display') !== 'none' && $("#menu_bar").width() < 100) {
        toggle_slide_bar('close');
        // alert('fhcfdfggg');
    }
});
//---------toggle dict slide up/down
function toggle_state_dict(id, dict) {
    $("#" + id).slideToggle('slow', function() {

    });
}
//$(e.target).parents().is('.auto_complete_results') 
//---------context menu
$("#main_content").on('mouseup', '.search_card', function() {
    window.addEventListener('contextmenu', (event) => {
        event.preventDefault();
        contextmenu.popup(remote.getCurrentWindow(), event.x, event.y);
    }, false);
});
let contextmenu = remote.Menu.buildFromTemplate([
    { label: lang['copy'], click() { clipboard.writeText(this.getSelection().toString()); } },
    {
        label: lang['translate'],
        click() {
            word_searching(this.getSelection().toString());
        }
    }
]);
//---------winsow when focus out
$(window).on('blur', () => {
    $("#main_search_input").focus();
    // $("#main_search_input").val()
    $("#main_search_input").select();
});
//---------forward,back words
var user_words = [];
var which_word = 0;
var not_search = false;
$("#next_user_word").click(() => {
    if (which_word == user_words.length - 1) return;
    which_word++;
    not_search = true;
    $("#main_search_input").val(user_words[which_word]);
    search_click();
    if (which_word == user_words.length - 1) $("#next_user_word").addClass('disabled');
    if (which_word > 0) $("#prev_user_word").removeClass('disabled');
});
$("#prev_user_word").click(() => {
    if (which_word == 0) return;
    which_word--;
    not_search = true;
    $("#main_search_input").val(user_words[which_word]);
    search_click();
    if (which_word == 0) $("#prev_user_word").addClass('disabled');
    if (which_word < user_words.length - 1) $("#next_user_word").removeClass('disabled');

});
//---------search in allowed databases


function search_data(text) {
    // alert(text);
    text = text.trim();
    if (text == "") return;
    $("#main_content").html("");
    $("#results_tab .menu").html("");
    $("head title").html(`${lang['kimia_dict']} - ${text}`);
    var ltype = lang['lang_type'];
    var ar = allowed_databases.split(',');
    var is_exist = false;
    var cc = 0;
    var records = 0;
    var rec = 0;
    if (text.length > 0) {
        var start = new Date();
        for (let i = 0; i < ar.length; i++) {
            var tmp3 = data_funcs.search_in_database(ar[i], text, ltype);
            //console.log(ar[i], text, tmp3);
            records += tmp3['total'];
            rec += tmp3['find'];
            if (tmp3['result'] == null) continue;
            is_exist = true;
            cc++;
            $("#results_tab .menu").append(`<a class='item' href='#dict_${i}'>${tmp3['name']}</a>`);
            $("#main_content").append(`
        <div class='search_card' id='dict_${i}'>
            <div class='search_card_header ${ltype}_style'>
                <h1 class="header ${ltype}_style">${tmp3['name']}</h1>
                <div style='float:${lang['non_float']};direction:ltr;'>
                    <i class="chevron down icon" onclick='toggle_state_dict(\"dict_con_${i}\",\"${ar[i]}\")'></i>
                    <i class="eye slash icon"></i>
                    <i class="question icon" ></i>
                </div>
            </div>
            <div class="search_card_content" id='dict_con_${i}'>
                ${tmp3['html']}
            </div>
        <div>`);
        }
        if (!is_exist) $("#main_content").html('');
        //---------------convert numbers
        var ret = data_funcs.convert_numeric(parseInt(text), ltype);
        if (ret[0].length > 1) {
            $("#main_content").append(`
        <div class='search_card' id='integer_convert'>
            <div class='search_card_header ${ltype}_style' style='background-color:#006E51; '>
                <h1 class="header ${ltype}_style">${lang['integer_convert']}</h1>
                <div style='float:${lang['non_float']};direction:ltr;'>
                    <i class="chevron down icon" onclick='toggle_state_dict(\"int_convert_content\",\"integer_convert\")'></i>
                    <i class="eye slash icon"></i>
                </div>
            </div>
            <div class="search_card_content" id='int_convert_content'> 
            <p class='en_style'>${parseInt(text)}</p>
            <p class=\"en_style\">${ret[0]}</p>
            <p class=\"${ltype}_style\">${ret[1]}</p>
            </div><div>`);
        }
        //---------------related items
        if (related_results > 0) {
            var related = `
        <div class='search_card' id='related_items'>
            <div class='search_card_header ${ltype}_style' style='background-color:#006E51; '>
                <h1 class="header ${ltype}_style">${lang['related_items']}</h1>
                <div style='float:${lang['non_float']};direction:ltr;'>
                    <i class="chevron down icon" onclick='toggle_state_dict(\"related_content\",\"related_items\")'></i>
                    <i class="eye slash icon"></i>
                </div>
            </div>
            <div class="search_card_content" id='related_content'>`;
            var cv = related_results;
            var cou = 0;
            var tmp6 = [];
            for (let i = 0; i < ar.length; i++) {
                var tmp3 = data_funcs.search_in_database(ar[i], text, ltype, 'related', related_results / 2);
                //console.log(ar[i], text, tmp3);
                if (tmp3 == null) continue;
                for (let b = 0; b < tmp3[2].length; b++) {
                    if (cv == 0) break;
                    if (tmp6.indexOf(tmp3[2][b]) > -1) continue;
                    tmp6.push(tmp3[2][b]);
                    cv--;
                    cou++;
                    related += `<p class=\"${tmp3[3]}_style\">${cou} - <span onclick='word_searching(\"${tmp3[2][b]}\")' title='${tmp3[0]}' class='link_trans'>${tmp3[2][b]}</span></p>`;

                }
                if (cv == 0) break;
                //related += tmp3;
                // alert(tmp3);
            }
            related += `</div><div>`;
            $("#main_content").append(related);
        }
        //---------------
        var end = new Date();
        var sec1 = (start.getSeconds() * 1000) + start.getMilliseconds();
        var sec2 = (end.getSeconds() * 1000) + end.getMilliseconds();
        var sec3 = sec2 - sec1;
        var sec = sec3 / 1000;
        //alert(":" + end + "," + start);
        $("#info_tab .menu").html(`
        <a class='item'>${cc}&nbsp;${lang['result']}&nbsp;${lang['in']}&nbsp;${sec}&nbsp;${lang['seconds']}</a>
        <a class='item'>${rec}&nbsp;${lang['records']}&nbsp;${lang['between']}&nbsp;${records}&nbsp;${lang['records']}</a>
        `);
    }

    //---------if not found
    if (!is_exist) {
        $("#main_content").prepend(`
        <div class='ui icon negative message ${ltype}_style'>
            <i class="exclamation red icon" style='margin:auto 10px;'></i>
            <div class="content" style='margin:0 5px;'>
                <div class="header ${ltype}_style">${lang['err345']}</div>
                <p>${lang['err865']}</p>
            </div>
        </div>`);
    } else if (user_words[user_words.length - 1] != text && !not_search) {
        user_words.push(text);
        which_word = user_words.length - 1;
        $("#next_user_word").addClass('disabled');
        $("#prev_user_word").removeClass('disabled');
    }
    not_search = false;
}