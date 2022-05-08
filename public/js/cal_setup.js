const days_of_week = [ 'sunday', 'monday', 'tuesday',
    'wednesday', 'thursday', 'friday', 'saturday' ];

const weekday = (y, m, d) => {
    return new Date(y, m, d).getDay();
};

const month_end = (y, m) => {
    return new Date(y, m + 1, 0).getDate();
};

const convert_format = event => {
    return {_id: event._id,
            title: event.title,
            date: date_to_string(event.deadline),
            time: time_to_string(event.deadline),
            priority: event.priority };
}

const date_to_string = date => { // Date -> YYYY-MM-DD
    let date_parts = [date.getMonth() + 1, date.getDate()];
    date_parts = date_parts.map(p => p.toString().padStart(2, '0'));
    return date.getFullYear() + '-' + date_parts.join('-');
}

const string_to_date = date_str => {
    let [y, m, d] = date_str.split('-');
    d = (parseInt(d) + 1).toString().padStart(2, '0');
    return new Date([y, m, d].join('-'));
}

const time_to_string = date => { // Date -> 00:00 AM
    return date.toLocaleString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
}

const TODAY = new Date();
let current = new Date();

let events = event_list.map(convert_format);

function create_thgroup() {
    let group = $('<div>').addClass('th-group');

    days_of_week.forEach((day, i) => {
        $('<h2>')
            .attr('id', `th-${i}`)
            .attr('data-day', days_of_week[i])
            .html(day.slice(0,3))
            .appendTo(group);
    });

    group.appendTo('#cal');
}

function create_rows(n) {
    for (let i = 0; i <= n; i++) {
        let row = $('<div>').addClass('row').attr('id', `tr-${i}`);
        for (let j = 0; j < 7; j++) {
            $('<div>')
                .addClass('cell')
                .addClass(`td-${days_of_week[j]}`)
                .attr('id', `td-${(i < 1 ? '0' : '')
                    + (i * 7 + j).toString(7)}`)
                .append($('<ol>').addClass('events'))
                .appendTo(row);
        }
        row.appendTo('#cal');
    }
}

function fill_cal(curr) {
    let last = new Date(curr);
    last.setDate(0);

    $('#cal-title').html(curr.toLocaleDateString('en-us', {
        month: 'long', year: 'numeric'}));

    let curr_start = weekday(curr.getFullYear(), curr.getMonth(), 1);
    let curr_end = month_end(curr.getFullYear(), curr.getMonth());
    let last_end = last.getDate();

    let next = new Date(curr);
    next.setDate(curr_end + 1);

    let format_str = (date) => {
        let y = date.getFullYear();
            m = date.getMonth() + 1;
        return [y, (m < 10 ? '0' + m : m)].join('-');
    };

    let curr_str_part = format_str(curr),
        last_str_part = format_str(last),
        next_str_part = format_str(next);

    let row_count = (curr_start + curr_end - 1).toString(7)[0];
    create_rows(row_count);

    let i = 0, date, str_part;
    let on_curr = false;
    if (curr_start) {
        date = last_end - curr_start + 1;
        str_part = last_str_part;
    } else {
        on_curr = true;
        date = 1;
        str_part = curr_str_part;
    }

    for (; i < (row_count + 1) * 7; i++) {
        let cell = $(`#td-${(i < 7 ? '0' : '') + i.toString(7)}`);
        cell.attr('data-date', `${str_part}-${(date < 10 ? '0' + date : date)}`)
            .prepend($('<h2>').text(date).attr('title', 'open expanded day view')
);

        if (i < curr_start) cell.addClass('last');
        else if (i >= curr_start + curr_end) cell.addClass('next');

        if (on_curr && curr.valueOf() == TODAY.valueOf()
                && date == curr.getDate()) {
            cell.addClass('today');
        }


        if (i == curr_start - 1) {
            str_part = curr_str_part;
            on_curr = true;
            date = 1;
        } else if (i == curr_start + curr_end - 1) {
            str_part = next_str_part;
            date = 1;
            on_curr = false;
        } else date++;
    }

    fill_events(events);
}

function fill_events(event_data) {
    $.each(event_data, (i, el) => {
        $('<li>')
            .addClass(`event-priority-${el.priority}`)
            .html(`<a href="/events/view/${el._id}">
                ${el.time} - ${el.title}
                </a>`)
            .appendTo(`.cell[data-date=${el.date}] .events`)
    });
}

function fill_event_list (event_data) {
    let msPerDay = 24 * 60 * 60 * 1000;
    $.each(event_data, (i, el) => {
        if((el.deadline.getTime() - TODAY.getTime()) / msPerDay <= 7) {
            $('<li>')
                .addClass(`event-priority-${el.priority}`)
                .html(`<a href="/events/view/${el._id}">
                    ${el.title} - ${deadline.toLocaleDateString('en-us', {
                        weekday: 'short',
                        month: 'long',
                        day: '2-digit',
                        year: 'numeric'
                    })}
                    </a>`)
                .appendTo(`#event-panel .events`)
        }    
    });
    $('#event-panel #event-panel-head #event-panel-date').text(curr.toLocaleDateString('en-us', {
        weekday: 'long', year: 'numeric', month: 'long', day: '2-digit'}));
}

function update_cal(date) {
    $('#cal .row').remove();
    fill_cal(date);
}

$('#btn-today').click(_ => {
    current = new Date(TODAY);
    update_cal(current);
});

$('#btn-last').click(_ => {
    current.setMonth(current.getMonth() - 1);
    update_cal(current);
});

$('#btn-next').click(_ => {
    current.setMonth(current.getMonth() + 1);
    update_cal(current);
});

$('#day #day-panel-head #day-panel-close').click(_ => {
    $('#day').hide();
})

$(document).on('submit', '#day form', (e => {
    let date = e.target
                .parentElement
                .firstElementChild.firstElementChild
                .innerText;
    $('#day form input[name="date"]').val(date);
}));

$(document).on('click','#cal .row .cell h2', (e => {
    let event_ol = e.target.parentElement.lastChild; // get events list
    if (event_ol.innerHTML.length > 0)
        $('#day .events').html(event_ol.innerHTML);
    else
        $('#day .events').html('<p>No events on this date.</p>');

    let date_str = e.target.parentElement.dataset.date;
    let date = string_to_date(date_str);
    $('#day #day-panel-date').text(date.toLocaleDateString('en-us', {
        weekday: 'short',
        month: 'long',
        day: '2-digit',
        year: 'numeric'
    }))
    $('#day').show();
}));

$(document).ready(_ => {
    create_thgroup();
    fill_event_list(event_list);
    fill_cal(current);
});
