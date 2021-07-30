(function ($) {
    $.fn.fancyTable = function (options) {
        var settings = $.extend({
            inputStyle: "",
            inputPlaceholder: "Search...",
            pagination: false,
            paginationClass: "btn btn-light",
            paginationClassActive: "active",
            pagClosest: 3,
            perPage: 10,
            sortable: true,
            searchable: true,
            onInit: function () { },
            onUpdate: function () { },
            testing: false
        }, options);
        var instance = this;
        this.settings = settings;
        this.tableUpdate = function (elm) {
            elm.fancyTable.matches = 0;
            $(elm).find("tbody tr").each(function () {
                var n = 0;
                var match = true;
                var globalMatch = false;
                $(this).find("td").each(function () {
                    if (!settings.globalSearch && elm.fancyTable.searchArr[n] && !(new RegExp(elm.fancyTable.searchArr[n], "i").test($(this).html()))) {
                        match = false;
                    } else if (settings.globalSearch && (!elm.fancyTable.search || (new RegExp(elm.fancyTable.search, "i").test($(this).html())))) {
                        if (!Array.isArray(settings.globalSearchExcludeColumns) || !settings.globalSearchExcludeColumns.includes(n + 1)) {
                            globalMatch = true;
                        }
                    }
                    n++;
                });
                if ((settings.globalSearch && globalMatch) || (!settings.globalSearch && match)) {
                    elm.fancyTable.matches++
                    if (!settings.pagination || (elm.fancyTable.matches > (elm.fancyTable.perPage * (elm.fancyTable.page - 1)) && elm.fancyTable.matches <= (elm.fancyTable.perPage * elm.fancyTable.page))) {
                        $(this).show();
                    } else {
                        $(this).hide();
                    }
                } else {
                    $(this).hide();
                }
            });
            elm.fancyTable.pages = Math.ceil(elm.fancyTable.matches / elm.fancyTable.perPage);
            if (settings.pagination) {
                var paginationElement = (elm.fancyTable.paginationElement) ? $(elm.fancyTable.paginationElement) : $(elm).find(".pag");
                paginationElement.empty();
                for (var n = 1; n <= elm.fancyTable.pages; n++) {
                    if (n == 1 || (n > (elm.fancyTable.page - (settings.pagClosest + 1)) && n < (elm.fancyTable.page + (settings.pagClosest + 1))) || n == elm.fancyTable.pages) {
                        var a = $("<a>", {
                            html: n,
                            "data-n": n,


                            style: "margin:0.2em",
                            class: settings.paginationClass + " " + ((n == elm.fancyTable.page) ? settings.paginationClassActive : "")
                        }).css("cursor", "pointer").bind("ctdlick", function () {
                            elm.fancyTable.page = $(this).data("n");
                            instance.tableUpdate(elm);
                        });
                        if (n == elm.fancyTable.pages && elm.fancyTable.page < (elm.fancyTable.pages - settings.pagClosest - 1)) {
                            paginationElement.append($("<span>...</span>"));
                        }
                        paginationElement.append(a);
                        if (n == 1 && elm.fancyTable.page > settings.pagClosest + 2) {
                            paginationElement.append($("<span>...</span>"));
                        }
                    }
                }
            }
            settings.onUpdate.call(this, elm);
        };
        this.reinit = function (elm) {
            $(this).each(function () {
                $(this).find("th a").contents().unwrap();
                $(this).find("tr.fancySearchRow").remove();
            });
            $(this).fancyTable(this.settings);
        };
        this.tableSort = function (elm) {
            if (typeof elm.fancyTable.sortColumn !== "undefined" && elm.fancyTable.sortColumn < elm.fancyTable.nColumns) {
                $(elm).find("thead th div.sortArrow").each(function () {
                    $(this).remove();
                });
                var sortArrow = $("<div>", { "class": "sortArrow" }).css({ "margin": "0.1em", "display": "inline-block", "width": 0, "height": 0, "border-left": "0.4em solid transparent", "border-right": "0.4em solid transparent" });
                sortArrow.css(
                    (elm.fancyTable.sortOrder > 0) ?
                        { "border-top": "0.4em solid #000" } :
                        { "border-bottom": "0.4em solid #000" }
                );
                $(elm).find("thead th a").eq(elm.fancyTable.sortColumn).append(sortArrow);
                var rows = $(elm).find("tbody tr").toArray().sort(
                    function (a, b) {
                        var elma = $(a).find("td").eq(elm.fancyTable.sortColumn);
                        var elmb = $(b).find("td").eq(elm.fancyTable.sortColumn);
                        var cmpa = $(elma).data("sortvalue") ? $(elma).data("sortvalue") : elma.html();
                        var cmpb = $(elmb).data("sortvalue") ? $(elmb).data("sortvalue") : elmb.html();
                        if (elm.fancyTable.sortAs[elm.fancyTable.sortColumn] == 'case-insensitive') {
                            cmpa = cmpa.toLowerCase();
                            cmpb = cmpb.toLowerCase();
                        }
                        if (elm.fancyTable.sortAs[elm.fancyTable.sortColumn] == 'numeric') {
                            return ((elm.fancyTable.sortOrder > 0) ? parseFloat(cmpa) - parseFloat(cmpb) : parseFloat(cmpb) - parseFloat(cmpa));
                        } else {
                            return ((cmpa < cmpb) ? -elm.fancyTable.sortOrder : (cmpa > cmpb) ? elm.fancyTable.sortOrder : 0);
                        }
                    }
                );
                $(elm).find("tbody").empty().append(rows);
            }
        };
        this.each(function () {
            if ($(this).prop("tagName") !== "TABLE") {
                console.warn("fancyTable: Element is not a table.");
                return true;
            }
            var elm = this;
            elm.fancyTable = {
                nColumns: $(elm).find("td").first().parent().find("td").length,
                nRows: $(this).find("tbody tr").length,
                perPage: settings.perPage,
                page: 1,
                pages: 0,
                matches: 0,
                searchArr: [],
                search: "",
                sortColumn: settings.sortColumn,
                sortOrder: (typeof settings.sortOrder === "undefined") ? 1 : (new RegExp("desc", "i").test(settings.sortOrder) || settings.sortOrder == -1) ? -1 : 1,
                sortAs: [], // null, numeric or case-insensitive
                paginationElement: settings.paginationElement
            };
            if ($(elm).find("tbody").length == 0) {
                var content = $(elm).html();
                $(elm).empty();
                $(elm).append("<tbody").append($(content));
            }
            if ($(elm).find("thead").length == 0) {
                $(elm).prepend($("<thead>"));
                // Maybe add generated headers at some point
                //var c=$(elm).find("tr").first().find("td").length;
                //for(var n=0; n<c; n++){
                //	$(elm).find("thead").append($("<th></th>"));
                //}
            }
            if (settings.sortable) {
                var n = 0;
                $(elm).find("thead th").each(function () {
                    elm.fancyTable.sortAs.push(
                        ($(this).data('sortas') == 'numeric') ? 'numeric' :
                            ($(this).data('sortas') == 'case-insensitive') ? 'case-insensitive' :
                                null
                    );
                    var content = $(this).html();
                    var a = $("<a>", {
                        html: content,
                        "data-n": n,
                        class: ""
                    }).css("cursor", "pointer").bind("click", function () {
                        if (elm.fancyTable.sortColumn == $(this).data("n")) {
                            elm.fancyTable.sortOrder = -elm.fancyTable.sortOrder;
                        } else {
                            elm.fancyTable.sortOrder = 1;
                        }
                        elm.fancyTable.sortColumn = $(this).data("n");
                        instance.tableSort(elm);
                        instance.tableUpdate(elm);
                    });
                    $(this).empty();
                    $(this).append(a);
                    n++;
                });
            }
            if (settings.searchable) {
                var searchHeader = $("<tr>").addClass("fancySearchRow");
                if (settings.globalSearch) {
                    var searchField = $("<input>", {
                        "placeholder": settings.inputPlaceholder,
                        style: "width:100%;" + settings.inputStyle
                    }).bind("change paste keyup", function () {
                        elm.fancyTable.search = $(this).val();
                        elm.fancyTable.page = 1;
                        instance.tableUpdate(elm);
                    });
                    var th = $("<th>", { style: "padding:2px;" }).attr("colspan", elm.fancyTable.nColumns);
                    $(searchField).appendTo($(th));
                    $(th).appendTo($(searchHeader));
                } else {
                    var n = 0;
                    $(elm).find("td").first().parent().find("td").each(function () {
                        elm.fancyTable.searchArr.push("");
                        var searchField = $("<input>", {
                            "data-n": n,
                            "placeholder": settings.inputPlaceholder,
                            style: "width:100%;" + settings.inputStyle
                        }).bind("change paste keyup", function () {
                            elm.fancyTable.searchArr[$(this).data("n")] = $(this).val();
                            elm.fancyTable.page = 1;
                            instance.tableUpdate(elm);
                        });
                        var th = $("<th>", { style: "padding:2px;" });
                        $(searchField).appendTo($(th));
                        $(th).appendTo($(searchHeader));
                        n++;
                    });
                }
                searchHeader.appendTo($(elm).find("thead"));
            }
            // Sort
            instance.tableSort(elm);
            if (settings.pagination && !settings.paginationElement) {
                $(elm).find("tfoot").remove();
                $(elm).append($("<tfoot><tr></tr></tfoot>"));
                $(elm).find("tfoot tr").append($("<td class='pag'></td>", {}).attr("colspan", elm.fancyTable.nColumns));
            }
            instance.tableUpdate(elm);
            settings.onInit.call(this, elm);
        });
        return this;
    };
}(jQuery));

!function (i) { i.fn.fancyTable = function (a) { var l = i.extend({ inputStyle: "", inputPlaceholder: "Search...", pagination: !1, paginationClass: "btn btn-light", paginationClassActive: "active", pagClosest: 3, perPage: 10, sortable: !0, searchable: !0, onInit: function () { }, onUpdate: function () { }, testing: !1 }, a), r = this; return this.settings = l, this.tableUpdate = function (n) { if (n.fancyTable.matches = 0, i(n).find("tbody tr").each(function () { var a = 0, e = !0, t = !1; i(this).find("td").each(function () { l.globalSearch || !n.fancyTable.searchArr[a] || new RegExp(n.fancyTable.searchArr[a], "i").test(i(this).html()) ? !l.globalSearch || n.fancyTable.search && !new RegExp(n.fancyTable.search, "i").test(i(this).html()) || Array.isArray(l.globalSearchExcludeColumns) && l.globalSearchExcludeColumns.includes(a + 1) || (t = !0) : e = !1, a++ }), l.globalSearch && t || !l.globalSearch && e ? (n.fancyTable.matches++, !l.pagination || n.fancyTable.matches > n.fancyTable.perPage * (n.fancyTable.page - 1) && n.fancyTable.matches <= n.fancyTable.perPage * n.fancyTable.page ? i(this).show() : i(this).hide()) : i(this).hide() }), n.fancyTable.pages = Math.ceil(n.fancyTable.matches / n.fancyTable.perPage), l.pagination) { var a = n.fancyTable.paginationElement ? i(n.fancyTable.paginationElement) : i(n).find(".pag"); a.empty(); for (var e, t = 1; t <= n.fancyTable.pages; t++)(1 == t || t > n.fancyTable.page - (l.pagClosest + 1) && t < n.fancyTable.page + (l.pagClosest + 1) || t == n.fancyTable.pages) && (e = i("<a>", { html: t, "data-n": t, style: "margin:0.2em", class: l.paginationClass + " " + (t == n.fancyTable.page ? l.paginationClassActive : "") }).css("cursor", "pointer").bind("click", function () { n.fancyTable.page = i(this).data("n"), r.tableUpdate(n) }), t == n.fancyTable.pages && n.fancyTable.page < n.fancyTable.pages - l.pagClosest - 1 && a.append(i("<span>...</span>")), a.append(e), 1 == t && n.fancyTable.page > l.pagClosest + 2 && a.append(i("<span>...</span>"))) } l.onUpdate.call(this, n) }, this.reinit = function (a) { i(this).each(function () { i(this).find("th a").contents().unwrap(), i(this).find("tr.fancySearchRow").remove() }), i(this).fancyTable(this.settings) }, this.tableSort = function (t) { var a; void 0 !== t.fancyTable.sortColumn && t.fancyTable.sortColumn < t.fancyTable.nColumns && (i(t).find("thead th div.sortArrow").each(function () { i(this).remove() }), (a = i("<div>", { class: "sortArrow" }).css({ margin: "0.1em", display: "inline-block", width: 0, height: 0, "border-left": "0.4em solid transparent", "border-right": "0.4em solid transparent" })).css(0 < t.fancyTable.sortOrder ? { "border-top": "0.4em solid #000" } : { "border-bottom": "0.4em solid #000" }), i(t).find("thead th a").eq(t.fancyTable.sortColumn).append(a), a = i(t).find("tbody tr").toArray().sort(function (a, e) { a = i(a).find("td").eq(t.fancyTable.sortColumn), e = i(e).find("td").eq(t.fancyTable.sortColumn), a = i(a).data("sortvalue") ? i(a).data("sortvalue") : a.html(), e = i(e).data("sortvalue") ? i(e).data("sortvalue") : e.html(); return "case-insensitive" == t.fancyTable.sortAs[t.fancyTable.sortColumn] && (a = a.toLowerCase(), e = e.toLowerCase()), "numeric" == t.fancyTable.sortAs[t.fancyTable.sortColumn] ? 0 < t.fancyTable.sortOrder ? parseFloat(a) - parseFloat(e) : parseFloat(e) - parseFloat(a) : a < e ? -t.fancyTable.sortOrder : e < a ? t.fancyTable.sortOrder : 0 }), i(t).find("tbody").empty().append(a)) }, this.each(function () { if ("TABLE" !== i(this).prop("tagName")) return console.warn("fancyTable: Element is not a table."), !0; var t, a, e, n, s = this; s.fancyTable = { nColumns: i(s).find("td").first().parent().find("td").length, nRows: i(this).find("tbody tr").length, perPage: l.perPage, page: 1, pages: 0, matches: 0, searchArr: [], search: "", sortColumn: l.sortColumn, sortOrder: void 0 !== l.sortOrder && (new RegExp("desc", "i").test(l.sortOrder) || -1 == l.sortOrder) ? -1 : 1, sortAs: [], paginationElement: l.paginationElement }, 0 == i(s).find("tbody").length && (e = i(s).html(), i(s).empty(), i(s).append("<tbody>").append(i(e))), 0 == i(s).find("thead").length && i(s).prepend(i("<thead>")), l.sortable && (n = 0, i(s).find("thead th").each(function () { s.fancyTable.sortAs.push("numeric" == i(this).data("sortas") ? "numeric" : "case-insensitive" == i(this).data("sortas") ? "case-insensitive" : null); var a = i(this).html(), a = i("<a>", { html: a, "data-n": n, class: "" }).css("cursor", "pointer").bind("click", function () { s.fancyTable.sortColumn == i(this).data("n") ? s.fancyTable.sortOrder = -s.fancyTable.sortOrder : s.fancyTable.sortOrder = 1, s.fancyTable.sortColumn = i(this).data("n"), r.tableSort(s), r.tableUpdate(s) }); i(this).empty(), i(this).append(a), n++ })), l.searchable && (t = i("<tr>").addClass("fancySearchRow"), l.globalSearch ? (a = i("<input>", { placeholder: l.inputPlaceholder, style: "width:100%;" + l.inputStyle }).bind("change paste keyup", function () { s.fancyTable.search = i(this).val(), s.fancyTable.page = 1, r.tableUpdate(s) }), e = i("<th>", { style: "padding:2px;" }).attr("colspan", s.fancyTable.nColumns), i(a).appendTo(i(e)), i(e).appendTo(i(t))) : (n = 0, i(s).find("td").first().parent().find("td").each(function () { s.fancyTable.searchArr.push(""); var a = i("<input>", { "data-n": n, placeholder: l.inputPlaceholder, style: "width:100%;" + l.inputStyle }).bind("change paste keyup", function () { s.fancyTable.searchArr[i(this).data("n")] = i(this).val(), s.fancyTable.page = 1, r.tableUpdate(s) }), e = i("<th>", { style: "padding:2px;" }); i(a).appendTo(i(e)), i(e).appendTo(i(t)), n++ })), t.appendTo(i(s).find("thead"))), r.tableSort(s), l.pagination && !l.paginationElement && (i(s).find("tfoot").remove(), i(s).append(i("<tfoot><tr></tr></tfoot>")), i(s).find("tfoot tr").append(i("<td class='pag'></td>", {}).attr("colspan", s.fancyTable.nColumns))), r.tableUpdate(s), l.onInit.call(this, s) }), this } }(jQuery);


$(document).ready(function () {
    // Generate a big table
    for (var n = 0; n < 10; n++) {
        let str = `${'item' + n} ${'brand_' + String.fromCharCode(n + 65)} ${'$' + n} ${100 + n} ${n % 3 == 0 ? 0 : 1}`
        let input = str.split(" ")
        var row = $("<tr onclick='forward(`" + str + "`)'>");
        $("#sampleTableA").find("thead th").each(function (temp) {
            if (temp == 0)
                $("<td>", {
                    html: input[0],
                    style: "padding:2px;"
                }).appendTo($(row));
            if (temp == 1)
                $("<td>", {
                    html: input[1],
                    style: "padding:2px;"
                }).appendTo($(row));
            if (temp == 2)
                $("<td>", {
                    html: input[2],
                    style: "padding:2px;"
                }).appendTo($(row));

            if (temp == 3)
                $("<td>", {
                    html: input[3],
                    style: "padding:2px;"
                }).appendTo($(row));

            if (temp == 4)
                $("<td>", {
                    html: input[4],
                    style: "padding:2px;"
                }).appendTo($(row));
        });

        row.appendTo($("#sampleTableA").find("tbody"));
    }
    // And make them fancy
    var fancyTableA = $("#sampleTableA").fancyTable({
        sortColumn: 0,
        pagination: true,
        perPage: 5,
        globalSearch: true
    });

});

function forward(q) {
    alert(q)
    $("#forward_form").submit();
}