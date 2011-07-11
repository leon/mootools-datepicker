/*
---
name: Picker.Date.Range
description: Select a Range of Dates
authors: Arian Stolwijk
requires: [Picker, Picker.Date]
provides: Picker.Date.Range
...
*/

Picker.Date.Range = new Class({

	Extends: Picker.Date,

	options: {
		getStartEndDate: function(input){
			return input.get('value').split('-').map(function(date){
				var parsed = Date.parse(date);
				return parsed.isValid() ? parsed : null;
			}).clean();
		},
		setStartEndDate: function(input, dates){
			input.set('value', dates.join(' - '));
		},
		footer: true
	},

	getInputDate: function(input){
		this.date = new Date();
		if (!input) return;

		var dates = input.retrieve('datepicker:value');
		if (!dates || !dates.every(function(date){
			return Date.isValid(date);
		})){

			dates = this.options.getStartEndDate(input);
			if (!dates.every(function(date){
				return Date.isValid(date);
			})) dates = [new Date];

		}

		if (dates.length == 1) this.date = this.startDate = this.endDate = dates[0];
		else if (dates.length == 2){
			this.startDate = dates[0];
			this.endDate = dates[1];
		}

		this.updateRangeSelection();
	},

	constructPicker: function(){
		this.parent();
		var footer = this.footer, self = this;
		if (!footer) return;

		var events = {
			click: function(){
				this.focus();
			},
			blur: function(){
				var date = Date.parse(this.get('value'));
				if (date.isValid) self[(this == startInput ? 'start' : 'end') + 'Date'] = date;
				self.updateRangeSelection();
			},
			keydown: function(event){
				if (event.key == 'enter') self.selectRange();
			}
		};

		var startInput = this.startInput = new Element('input', {events: Object.merge(events, {
			click: function(){
				startInput.focus();
			}
		})}).inject(footer);

		new Element('span', {text: ' - '}).inject(footer);

		var endInput = this.endInput = new Element('input', {events: Object.merge(events, {
			click: function(){
				endInput.focus();
			}
		})}).inject(footer);

		this.applyButton = new Element('button.apply', {
			text: Locale.get('DatePicker.apply_range'),
			events: {click: self.selectRange.pass([], self)}
		}).inject(footer);

		this.cancelButton = new Element('button.cancel', {
			text: Locale.get('DatePicker.cancel'),
			events: {click: self.close.pass(false, self)}
		}).inject(footer);

	},

	renderDays: function(){
		this.parent.apply(this, arguments);
		this.updateRangeSelection();
	},

	select: function(date){
		if (this.startDate && (this.endDate == this.startDate || date > this.endDate) && date >= this.startDate) this.endDate = date;
		else {
			this.startDate = date;
			this.endDate = date;
		}

		this.updateRangeSelection();
	},

	selectRange: function(){
		this.date = this.startDate;
		var dates = [this.startDate, this.endDate], input = this.input;

		input.store('datepicker:value', dates.map(function(date){
			return date.strftime();
		}));

		this.options.setStartEndDate(input, [
			this.startInput.get('value'),
			this.endInput.get('value')
		]);

		this.fireEvent('select', dates);
		this.close();
		input.blur();
		return this;
	},

	updateRangeSelection: function(){
		var start = this.startDate,
			end = this.endDate || start;

		if (this.dateElements) for (var i = this.dateElements.length; i--;){
			var el = this.dateElements[i];
			if (el.time >= start && el.time <= end) el.element.addClass('selected');
			else el.element.removeClass('selected');
		}

		var formattedFirst = start.format(this.options.format)
			formattedEnd = end.format(this.options.format);

		this.startInput.set('value', formattedFirst);
		this.endInput.set('value', formattedEnd);

		this.date = new Date((+start + +end) / 2);

		return this;
	}

});


