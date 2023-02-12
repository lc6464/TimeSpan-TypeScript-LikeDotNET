// https://learn.microsoft.com/zh-cn/dotnet/api/system.timespan?view=net-7.0

export default class TimeSpan {
	public static readonly millisecondsPerSecond = 1000;
	public static readonly millisecondsPerMinute = TimeSpan.millisecondsPerSecond * 60;		// 60,000
	public static readonly millisecondsPerHour = TimeSpan.millisecondsPerMinute * 60;		// 3,600,000
	public static readonly millisecondsPerDay = TimeSpan.millisecondsPerHour * 24;			// 86,400,000

	/*private static readonly maxSeconds = Number.MAX_SAFE_INTEGER / TimeSpan.millisecondsPerSecond;
	private static readonly minSeconds = Number.MIN_SAFE_INTEGER / TimeSpan.millisecondsPerSecond;*/

	private static readonly maxMilliseconds = Number.MAX_SAFE_INTEGER;
	private static readonly minMilliseconds = Number.MIN_SAFE_INTEGER;

	//private static readonly millisecondsPerTenthSecond = 100;

	public static readonly zero = new TimeSpan(0);

	public static readonly maxValue = new TimeSpan(Number.MAX_SAFE_INTEGER);
	public static readonly minValue = new TimeSpan(Number.MIN_SAFE_INTEGER);

	private static readonly overflowExceptionMessage = 'TimeSpan overflowed because the duration is too long.';


	private static isOverflow(value: number) {
		return value > TimeSpan.maxMilliseconds || value < TimeSpan.minMilliseconds;
	}

	private isOverflow() {
		return TimeSpan.isOverflow(this._value);
	}

	private static ensureNoOverflow(value: number) {
		if (TimeSpan.isOverflow(value)) {
			throw new Error(TimeSpan.overflowExceptionMessage);
		}
	}

	private ensureNoOverflow() {
		if (this.isOverflow()) {
			throw new Error(TimeSpan.overflowExceptionMessage);
		}
	}


	private readonly _value: number;
	/*
	constructor(millisecondsOrDaysOrHours?: number)
	constructor(millisecondsOrDaysOrHours?: number, hoursOrMinutes?: number, minutesOrSeconds?: number)
	constructor(millisecondsOrDaysOrHours?: number, hoursOrMinutes?: number, minutesOrSeconds?: number, seconds?: number, milliseconds?: number)
	*/
	constructor(milliseconds?: number);
	constructor(hours: number, minutes: number, seconds: number);
	constructor(days: number, hours: number, minutes: number, seconds: number, milliseconds?: number);
	constructor(millisecondsOrDaysOrHours?: number, hoursOrMinutes?: number, minutesOrSeconds?: number, seconds?: number, milliseconds?: number) {
		if (Number.isNaN(millisecondsOrDaysOrHours) || Number.isNaN(hoursOrMinutes) || Number.isNaN(minutesOrSeconds) || Number.isNaN(seconds) || Number.isNaN(milliseconds)) {
			throw new Error('At least one of the arguments is not a number.');
		}

		if (millisecondsOrDaysOrHours === null || millisecondsOrDaysOrHours === undefined) { // 重载0（输入为空）
			this._value = 0;
		} else if (seconds !== null && seconds !== undefined) { // 重载2（带天）
			if (hoursOrMinutes === null || hoursOrMinutes === undefined || minutesOrSeconds === null || minutesOrSeconds === undefined) throw new Error('The argument "hours" or "minutes" is null or undefined.');
			this._value = Math.trunc(milliseconds ?? 0) + Math.trunc(seconds) * TimeSpan.millisecondsPerSecond + Math.trunc(minutesOrSeconds) * TimeSpan.millisecondsPerMinute + Math.trunc(hoursOrMinutes) * TimeSpan.millisecondsPerHour + Math.trunc(millisecondsOrDaysOrHours) * TimeSpan.millisecondsPerDay;
		} else if (minutesOrSeconds !== null && minutesOrSeconds !== undefined) { // 重载1（不带天）
			if (hoursOrMinutes === null || hoursOrMinutes === undefined) throw new Error('The argument "hours" is null or undefined.');
			this._value = Math.trunc(minutesOrSeconds) * TimeSpan.millisecondsPerSecond + Math.trunc(hoursOrMinutes) * TimeSpan.millisecondsPerMinute + Math.trunc(millisecondsOrDaysOrHours) * TimeSpan.millisecondsPerHour;
		} else if (hoursOrMinutes !== null && hoursOrMinutes !== undefined) { // 传入2个参数，不知要干啥
			throw new Error(`Cannot find an overload for constructor and the argument count: "${arguments.length}".`);
		} else { // 重载0（毫秒）
			this._value = Math.trunc(millisecondsOrDaysOrHours);
		}

		this.ensureNoOverflow();
	}

	public get totalMilliseconds() {
		return this._value;
	}
	public get totalSeconds() {
		return this._value / TimeSpan.millisecondsPerSecond;
	}
	public get totalMinutes() {
		return this._value / TimeSpan.millisecondsPerMinute;
	}
	public get totalHours() {
		return this._value / TimeSpan.millisecondsPerHour;
	}
	public get totalDays() {
		return this._value / TimeSpan.millisecondsPerDay;
	}
	public get days() {
		return Math.trunc(this._value / TimeSpan.millisecondsPerDay);
	}
	public get hours() {
		return Math.trunc((this._value / TimeSpan.millisecondsPerHour) % 24);
	}
	public get minutes() {
		return Math.trunc((this._value / TimeSpan.millisecondsPerMinute) % 60);
	}
	public get seconds() {
		return Math.trunc((this._value / TimeSpan.millisecondsPerSecond) % 60);
	}
	public get milliseconds() {
		return Math.trunc(this._value % 1000);
	}

	public add(ts: TimeSpan) {
		const newValue = ts._value + this._value;
		TimeSpan.ensureNoOverflow(newValue);
		return new TimeSpan(newValue);
	}
	public static Compare(t1: TimeSpan, t2: TimeSpan) {
		if (t1._value > t2._value) return 1;
		if (t1._value < t2._value) return -1;
		return 0;
	}
	public CompareTo(value: TimeSpan) {
		const t = value._value;
		if (this._value > t) return 1;
		if (this._value < t) return -1;
		return 0;
	}
	public Duration() {
		if (this._value === TimeSpan.minValue.milliseconds)
			throw new Error('The duration cannot be returned for TimeSpan.minValue because the absolute value of TimeSpan.MinValue exceeds the value of TimeSpan.maxValue.');
		return new TimeSpan(this._value >= 0 ? this._value : -this._value);
	}
	public Equals(ts: TimeSpan) {
		return this._value === ts._value;
	}
	public static Equals(t1: TimeSpan, t2: TimeSpan) {
		return t1._value === t2._value;
	}


	public Negate() {
		if (this.milliseconds === TimeSpan.minValue.milliseconds)
			throw new Error('Negating the minimum value of a twos complement number is invalid.');
		return new TimeSpan(-this._value);
	}
	public Subtract(ts: TimeSpan) {
		const result = this._value - ts._value;
		TimeSpan.ensureNoOverflow(result);
		return new TimeSpan(result);
	}


	public valueOf() {
		return this._value;
	}
	public toString() {
		return `${this.days}.${this.hours}:${this.minutes}:${this.seconds}.${this.milliseconds}`;
	}
}