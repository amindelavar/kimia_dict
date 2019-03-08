const reading_funcs = require("./reading_funcs");
//***************************************************************************************
exports.search_auto_data = function(data, text, count) {
        var rets = [];
        if (text.length == 0) return rets;
        text = text.toLowerCase();
        var ar = data.split("\n");
        var cc = 0;
        for (let i = 0; i < ar.length; i++) {
            if (cc >= count) {
                break;
            }
            var ar1 = ar[i].split("@");
            // ar1[1] = ar1[1].replace('ي', 'ی');
            if (exports.search_in_string(ar1[0].toLowerCase(), text, false) > -1 && rets.indexOf(ar1[0]) == -1) {
                rets.push(ar1[0]);
                cc++;
            } else if (exports.search_in_string(ar1[1], text, false) > -1 && rets.indexOf(ar1[1]) == -1) {
                rets.push(ar1[1]);
                cc++;
            }
        }
        return rets;
    }
    //***************************************************************************************
exports.search_in_string = function(txt1, txt2, is_ad) {
    if (txt1 == undefined || txt1.length < txt2.length) return -1;
    for (let i = 0; i < txt1.length; i++) {
        var le = i + txt2.length;
        if (le < txt1.length) {
            var is_exist = true;
            var c = -1;
            for (let b = i; b < le; b++) {
                c++;
                if (txt2[c] != txt1[b]) {
                    is_exist = false;
                    break;
                }
            }
            if (!is_ad && is_exist) return i;
            else if (is_ad && is_exist && (i == 0 || txt1[i - 1] == ' ') && (le >= txt1.length || txt1[le] == ' ')) return i;
        }

    }
    return -1;
}

//***************************************************************************************
exports.search_in_database = function(name, text, lang, type, count) {
        if (text.length == 0) return "";
        text = text.toLowerCase();
        text = text.replace("ي", "ی");
        var data = reading_funcs.load_normal_file(`${__dirname}/../databases/${name}.bnu`);
        var lines = data.split('\n');
        var ret = [];
        var config = [];
        for (let i = 0; i < lines.length; i++) {
            const ele = lines[i].trim();
            if (ele.length < 2 || (ele[0] == '/' && ele[0] == '/')) {
                continue;
            }
            if (ele[0] == '#' && ele.split(';').length == 2) {
                var ar = ele.split(';');
                config[ar[0].trim()] = ar[1].trim();
            } else {
                break;
            }
        }
        // console.log(lines[0], config);
        if (config['#name'] == undefined) {
            return null;
        }
        var data_name = config['#name'].split('$$');
        var data_lang = config['#lang'].split('$$');
        var name = data_name[data_lang.indexOf(lang)];
        if (name == undefined) name = data_name[0];
        ret['name'] = name;
        ret['text'] = text;
        //---------------------related type
        if (type == 'related') {
            var tmp1 = exports.search_related_database(lines, text, config['#type'], count);
            tmp1.unshift(name);
            var lang = data_lang[tmp1[1]];
            if (tmp1[2].length == 0) {
                return null;
            }
            tmp1.push(lang);
            return tmp1;
        }
        //---------------------simple type
        else if (config['#type'] == 'simple') {
            var tmp1 = exports.search_simple_database(lines, text);
            ret['align'] = tmp1[1];
            ret['result'] = tmp1[2];
            ret['total'] = tmp1[3];
            ret['find'] = tmp1[4];
            var lang = data_lang[tmp1[1]];
            var non_lang = data_lang[0];
            if (tmp1[1] == 0) var non_lang = data_lang[1];
            if (ret['result'] != '') {
                var html = `
            <p class=\"${lang}_style\">${ret['text']}</p>
            <p class=\"${non_lang}_style\">${ret['result']}</p>
            `;
                ret['html'] = html;
            } else {
                ret['result'] = null;
            }
            return ret;
        }
        //---------------------list type
        else if (config['#type'] == 'list') {
            var tmp1 = exports.search_list_database(lines, text);
            ret['align'] = tmp1[1];
            ret['result'] = tmp1[2];
            ret['total'] = tmp1[3];
            ret['find'] = tmp1[4];
            var lang = data_lang[tmp1[1]];
            var non_lang = data_lang[0];
            if (tmp1[1] == 0) var non_lang = data_lang[1];
            // alert(name + ":" + lang + "-" + tmp1[2]);

            var html = "";
            for (let i = 0; i < tmp1[2][0].length; i++) {
                var txt = tmp1[2][0][i].replace(text, `<span class='sel_sp'>${text}</span>`);
                html += `
             <p class=\"${lang}_style\">${i+1} - ${txt}</p>
             <p class=\"${non_lang}_style\">${tmp1[2][1][i]}</p>
             <div class=\"ui section divider\"></div>
             `;
            }
            if (html == '') {
                ret['result'] = null;
            }
            ret['html'] = html;
            return ret;
        }
        //---------------------list_same type
        else if (config['#type'] == 'list_same') {
            var tmp1 = exports.search_list_same_database(lines, text);
            ret['align'] = tmp1[1];
            ret['result'] = tmp1[2];
            ret['total'] = tmp1[3];
            ret['find'] = tmp1[4];
            var lang = data_lang[tmp1[1]];
            // alert(name + ":" + lang + "-" + tmp1[2]);
            if (ret['result'].length > 0) {
                var html = `<p class=\"${lang}_style\">${tmp1[0]}</p>`;
                for (let i = 0; i < tmp1[2].length; i++) {
                    html += `
             <p class=\"${lang}_style\">${i+1} - ${tmp1[2][i]}</p>
             <div class=\"ui section divider\"></div>
             `;
                }
                ret['html'] = html;
            } else {
                ret['result'] = null;
            }
            return ret;
        }
    }
    //***************************************************************************************
exports.search_simple_database = function(lines, text) {
        var ret = [text, 0, "", 0, 0];
        var tmp = [];
        var ll = -1;
        var cc = 0;
        var cc1 = 0;
        for (let i = 0; i < lines.length; i++) {
            const ele = lines[i];
            if (ele.length < 2 || (ele[0] == '/' && ele[0] == '/')) {
                continue;
            }
            var ar1 = ele.toLowerCase().trim().split('@');
            if (ar1.length != 2) continue;
            cc++;
            ar1[1] = ar1[1].replace("ي", "ی");
            if ((ll == -1 || ll == 0) && ar1[0].trim() === text && tmp.indexOf(ar1[1].trim()) == -1) {
                tmp.push(ar1[1]);
                ll = 0;
                cc1++;
            } else if ((ll == -1 || ll == 1) && ar1[1].trim() === text && tmp.indexOf(ar1[0].trim()) == -1) {
                tmp.push(ar1[0]);
                ll = 1;
                cc1++;
            }
        }
        //console.log(tmp);
        ret[1] = ll;
        ret[2] = tmp.join(" - ");
        ret[3] = cc;
        ret[4] = cc1;
        return ret;
    }
    //***************************************************************************************
exports.search_list_database = function(lines, text) {
        var ret = [text, 0, "", 0, 0];
        var titles = [];
        var trans = [];
        var ll = -1;
        var cc = 0;
        var cc1 = 0;
        for (let i = 0; i < lines.length; i++) {
            const ele = lines[i];
            if (ele.length < 2 || (ele[0] == '/' && ele[0] == '/')) {
                continue;
            }
            var ar1 = ele.toLowerCase().replace('ي', 'ی').split('@');
            if (ar1.length != 2) continue;
            cc++;
            if (ll == -1 || ll == 0) ar1[0] = ar1[0].trim();
            if (ll == -1 || ll == 1) ar1[1] = ar1[1].trim();
            if ((ll == -1 || ll == 0) && (ar1[0] == text || exports.search_in_string(ar1[0], text, true) > -1) && titles.indexOf(ar1[0]) == -1) {
                titles.push(ar1[0]);
                trans.push(ar1[1]);
                ll = 0;
                cc1++;
            } else if ((ll == -1 || ll == 1) && (ar1[1] == text || exports.search_in_string(ar1[1], text, true) > -1) && titles.indexOf(ar1[1]) == -1) {
                titles.push(ar1[1]);
                trans.push(ar1[0]);
                ll = 1;
                cc1++;
            }
        }
        ret[1] = ll;
        ret[3] = cc;
        ret[4] = cc1;
        ret[2] = [titles, trans];
        return ret;
    }
    //***************************************************************************************
exports.search_list_same_database = function(lines, text) {
        var ret = [text, 0, "", 0, 0];
        var trans = [];
        var cc = 0;
        var cc1 = 0;
        for (let i = 0; i < lines.length; i++) {
            const ele = lines[i];
            if (ele.length < 2 || (ele[0] == '/' && ele[0] == '/')) {
                continue;
            }
            var ar1 = ele.toLowerCase().split('@');
            if (ar1.length != 2) continue;
            //ar1[1] = ar1[1].replace('ي', 'ی');
            cc++;
            if (ar1[0].trim() === text && trans.indexOf(ar1[1].trim()) == -1) {
                trans.push(ar1[1].trim());
                cc1++;
            }
        }
        ret[2] = trans;
        ret[3] = cc;
        ret[4] = cc1;
        return ret;
    }
    //***************************************************************************************
exports.search_related_database = function(lines, text, type, count) {
        var ret = [0, ""];
        var tmp = [];
        var tmp2 = [];
        var ll = -1;
        var cc = 0;
        //var cc1 = 0;
        for (let i = 0; i < lines.length; i++) {
            const ele = lines[i];
            if (ele.length < 3 || (ele[0] == '/' && ele[0] == '/')) {
                continue;
            }
            var ar1 = ele.toLowerCase().replace("ي", "ی").split('@');
            if (ar1.length != 2) continue;
            ar1[0] = ar1[0].trim();
            if (type == 'simple' || type == 'list') {
                ar1[1] = ar1[1].trim();
                if ((ll == -1 || ll == 0)) {
                    //cc1++;
                    var co = exports.is_near_text(ar1[0], text);
                    if (co > 0) {
                        tmp2.push({ word: ar1[0], co: co });
                        ll = 0;
                        continue;
                    }
                }
                if ((ll == -1 || ll == 1)) {
                    //cc1++;
                    var co = exports.is_near_text(ar1[1], text);
                    if (co > 0) {
                        tmp2.push({ word: ar1[1], co: co });
                        ll = 1;
                    }
                }
            } else if (type == 'list_same') {
                var co = exports.is_near_text(ar1[0], text);
                if (co > 0) {
                    tmp2.push({ word: ar1[0], co: co });
                    ll = 0;
                }

            }
        }
        while (true) {
            if (cc == count) break;
            var best = 0,
                ch = -1,
                b = 0;
            for (b = 0; b < tmp2.length; b++) {
                if (tmp2[b]['co'] > best && tmp2[b]['co'] > 0) {
                    best = tmp2[b]['co'];
                    ch = b;
                }
            }
            if (best == 0) break;
            tmp.push(tmp2[ch]['word']);
            tmp2[ch][b] = 0;
            cc++;
        }
        //console.log(tmp);
        ret[0] = ll;
        ret[1] = tmp;
        return ret;
    }
    //***************************************************************************************
exports.is_near_text = function(val, text) {
        var len = text.length;
        var len2 = val.length;
        //  if (exports.search_in_string(val, "کیمیا", false) > -1) {
        //console.log("OK:" + val);
        // }
        if (len2 < len / 2 || val == text || len2 > len * 3) {
            return 0;
        }
        var co = 0;
        if (len2 > 1 && len2 <= len) {
            for (var j = 0; j < len2; j++) {
                if (val.charAt(j) === text.charAt(j)) {
                    co++;
                }
            }
            if (co > 2) {
                // console.log(val, co);
                return co;
            }
        } else if (len <= 10 && len2 > len) {
            for (var j = 0; j < len; j++) {
                if (val.charAt(j) === text.charAt(j)) {
                    co++;
                }
            }
            if (co > 1) {
                //console.log(val, co);
                return co;
            }
        }
        return 0;

    }
    //***************************************************************************************
exports.detect_char_language = function(keypress) {
        var fa = /^[\u0600-\u06FF\s]+$/;
        if ((keypress.charCode >= 32 /*space*/ && keypress.charCode <= 126 /*~*/ ))
            return "en";
        else if (fa.test(keypress.key))
            return "fa";
        else
            return null;
    }
    //***************************************************************************************
exports.convert_numeric = function(num, lang) {
    var ret = ["", ""];
    if (num === NaN) return ret;
    var con = "";
    //convert to en
    var en1 = ["Zero", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten"];
    var en2 = ["Eleven", "Twelve", "Thirteen", "fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
    var en3 = ["Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];
    if (num >= 0 && num <= 10) {
        con = en1[num];
    } else if (num > 10 && num < 20) {
        con = en2[num - 11];
    } else if (num >= 20 && num < 100) {
        var y1 = num % 10;
        if (y1 == 0) {
            con = en3[(num - 20) / 10];
        } else {
            var y2 = num - y1;
            var x1 = Math.floor((y2 - 20) / 10);
            con = en3[x1] + " " + en1[y1];
        }
    } else if (num >= 100 && num < 1000) {
        var y2 = num % 100;
        if (y2 == 0) {
            con = en1[Math.floor(num / 100)] + " hundred";
        } else {
            var y1 = y2 % 10;
            var y3 = y2 - y1;
            // alert(y2, (y2 - 20) / 10);
            var x1 = Math.floor((num - y2) / 100);
            var x2 = Math.floor((y2 - 20) / 10);
            con = en1[x1] + " hundred and " + en3[x2] + " " + en1[y1];
        }
    }
    ret[0] = con;
    con = "";
    //convert to fa
    if (lang == 'fa') {
        var fa1 = ["صفر", "یک", "دو", "سه", "چهار", "پنج", "شش", "هفت", "هشت", "نه", "ده"];
        var fa2 = ["یازده", "دوازده", "سیزده", "چهارده", "پانزده", "شانزده", "هفده", "هجده", "نوزده"];
        var fa3 = ["بیست", "سی", "چهل", "پنجاه", "شصت", "هفتاد", "هشتاد", "نود"];
        var fa4 = ["zero", "یکصد", "دویست", "سیصد", "چهارصد", "پانصد", "ششصد", "هفتصد", "هشت صد", "نهصد"];
        if (num >= 0 && num <= 10) {
            con = fa1[num];
        } else if (num > 10 && num < 20) {
            con = fa2[num - 11];
        } else if (num >= 20 && num < 100) {
            var y1 = num % 10;
            if (y1 == 0) {
                con = fa3[(num - 20) / 10];
            } else {
                var y2 = num - y1;
                var x1 = Math.floor((y2 - 20) / 10);
                con = fa3[x1] + " و " + fa1[y1];
            }
        } else if (num >= 100 && num < 1000) {
            var y2 = num % 100;
            if (y2 == 0) {
                con = fa1[Math.floor(num / 100)] + " صد";
            } else {
                var y1 = y2 % 10;
                var y3 = y2 - y1;
                var x1 = Math.floor((num - y2) / 100);
                var x2 = Math.floor((y2 - 20) / 10);
                con = fa4[x1] + " و " + fa3[x2] + " و " + fa1[y1];
            }
        }
        ret[1] = con;
    }



    return ret;
}