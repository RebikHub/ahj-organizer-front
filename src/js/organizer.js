import Record from './record';
import notificationBox from './notification';

export default class Organizer {
  constructor(server) {
    this.server = server;
    this.organizer = document.getElementById('organizer');
    this.organizerRecords = document.querySelector('.organizer-records');
    this.organizerInputText = document.querySelector('.organizer-input-text');

    this.message = null;
    this.modal = document.querySelector('.modal');
    this.modalInput = document.querySelector('.modal-input-text');
    this.ok = document.querySelector('.modal-ok');
    this.cancel = document.querySelector('.modal-cancel');
    this.error = document.querySelector('.input-error');
    this.audioBtn = document.querySelector('.organizer-input-audio');
    this.videoBtn = document.querySelector('.organizer-input-video');
    this.enterBtn = document.querySelector('.organizer-input-enter');
    this.imageBtn = document.querySelector('.organizer-input-image');
    this.geoBtn = document.querySelector('.organizer-input-geo');
    this.timer = document.querySelector('.timer');
    this.recorder = null;
    this.createElement = null;
    this.timerId = null;
    this.min = 0;
    this.sec = 0;
  }

  events() {
    this.organizerInputText.focus();
    this.inputText();
    this.inputTextEnter();
    this.inputTextClickBtnEnter();
    this.clickAudioVideo(this.videoBtn);
    this.clickAudioVideo(this.audioBtn);
    this.pinnedContent();
    this.closePinned();

    this.initOrganizer();
  }

  async initOrganizer() {
    const store = await this.server.loadStore();
    store.sort((a, b) => {
      if (a.date > b.date) {
        return 1;
      }
      if (a.date < b.date) {
        return -1;
      }
      return 0;
    });

    console.log(store);
    for (const i of store) {
      if (i.type === 'message') {
        this.createDataMessage(i.file);
      }
      if (i.type === 'image') {
        Organizer.createDataImage(i.file);
      }
      if (i.type === 'text') {
        Organizer.readFile(i.file);
      }
    }
  }

  createDataMessage(content) {
    const record = Organizer.createRecord(content);
    this.addDataToOrgRecords(record);
    this.organizerInputText.value = null;
    Organizer.scrollToBottom(this.organizerRecords);
  }

  static createTextInputRecord(div, content) {
    if (typeof content === 'string' && (/^https:\/\//.test(content) || /^http:\/\//.test(content))) {
      const contents = document.createElement('div');
      const link = document.createElement('a');
      content.trim();
      link.href = content;
      link.target = '_blank';
      link.style.color = 'aliceblue';
      link.textContent = content;
      contents.append(link);
      div.appendChild(contents);
    } else if (typeof content === 'string') {
      const contents = document.createElement('p');
      contents.className = 'record-text';
      div.appendChild(contents);
      contents.textContent = content.trim();
    } else {
      div.appendChild(content);
    }
  }

  static createRecord(content) {
    const record = document.createElement('div');
    const recTitle = document.createElement('div');
    const date = document.createElement('div');
    const attach = document.createElement('div');
    recTitle.classList.add('record-title');
    attach.classList.add('record-attach');
    record.classList.add('record');
    date.classList.add('record-date');
    date.textContent = Organizer.getDate();
    recTitle.append(attach);
    recTitle.append(date);
    record.append(recTitle);

    Organizer.createTextInputRecord(record, content);

    return record;
  }

  pinnedContent() {
    this.organizerRecords.addEventListener('click', (ev) => {
      if (ev.target.classList.contains('record-attach')) {
        const box = ev.target.closest('.record');
        for (const i of document.querySelectorAll('.record')) {
          if (i === box) {
            if (this.organizer.querySelector('.record-pin')) {
              this.organizer.querySelector('.record-pin').remove();
            }
            const clone = i.cloneNode(true);
            clone.querySelector('.record-title').classList.add('pin-close');
            clone.querySelector('.pin-close').classList.remove('record-title');
            clone.querySelector('.pin-close').textContent = '';
            if (clone.querySelector('.drop-image')) {
              clone.querySelector('.drop-image').classList.add('pin-image');
              clone.querySelector('.pin-image').classList.remove('drop-image');
            }
            clone.className = 'record-pin';
            this.organizer.append(clone);
          }
        }
      }
    });
  }

  closePinned() {
    this.organizer.addEventListener('click', (ev) => {
      if (ev.target.classList.contains('pin-close')) {
        this.organizer.querySelector('.record-pin').remove();
      }
    });
  }

  static createDataFile(data, dataLink) {
    const orgRec = document.querySelector('.organizer-records');

    const dataFile = document.createElement('div');
    const name = document.createElement('p');
    const size = document.createElement('p');
    const link = document.createElement('a');
    link.classList.add('link-download');
    dataFile.classList.add('drop-file');
    name.classList.add('drop-file-name');
    size.classList.add('drop-file-size');
    name.textContent = data.name;
    if (data.size >= 1048576) {
      size.textContent = `Size: ${Number((data.size / 1048576).toFixed(2))} Mb`;
    } else if (data.size < 1048576) {
      size.textContent = `Size: ${Number((data.size / 1024).toFixed(2))} Kb`;
    }
    link.href = dataLink;
    // link.dataset.name = `${data.name}`;
    link.setAttribute('download', `${data.name}`);
    dataFile.append(link);
    dataFile.append(name);
    dataFile.append(size);
    orgRec.append(Organizer.createRecord(dataFile));
    Organizer.scrollToBottom(orgRec);
  }

  static readFile(file) {
    const fileReader = new FileReader();
    fileReader.onload = (ev) => Organizer.createDataFile(file, ev.target.result);
    fileReader.readAsDataURL(file);
  }

  static addImage(image, dataLink) {
    const orgRec = document.querySelector('.organizer-records');

    const divImg = document.createElement('div');
    const name = document.createElement('p');
    const link = document.createElement('a');
    link.classList.add('link-download');
    link.dataset.name = `${image.alt}`;
    link.setAttribute('download', `${image.alt}`);
    link.href = dataLink;
    name.classList.add('drop-file-name');
    divImg.classList.add('image');
    divImg.append(link);
    divImg.append(image);
    orgRec.appendChild(Organizer.createRecord(divImg));
    Organizer.scrollToBottom(orgRec);
  }

  static createDataImage(file) {
    const url = URL.createObjectURL(file);
    const image = document.createElement('img');
    image.className = 'drop-image';
    image.src = url;
    image.alt = file.name;
    image.onload = () => {
      const fileReader = new FileReader();
      fileReader.onload = (ev) => Organizer.addImage(image, ev.target.result);
      fileReader.readAsDataURL(file);
    };
  }

  addDataToOrgRecords(record) {
    this.organizerRecords.appendChild(record);
    if (this.message !== null) {
      this.server.saveMessages({
        type: 'message',
        file: this.message,
        date: new Date().getTime(),
      });
      this.message = null;
      this.createElement = null;
    }
  }

  timerRec() {
    this.min = 0;
    this.sec = 0;

    this.timerId = setInterval(() => {
      if (this.sec === 60) {
        this.min += 1;
        this.sec = 0;
      }

      if (this.min < 10 && this.sec < 10) {
        this.timer.textContent = `0${this.min}:0${this.sec}`;
      } else if (this.min < 10 && this.sec > 9) {
        this.timer.textContent = `0${this.min}:${this.sec}`;
      } else if (this.min > 9 && this.sec < 10) {
        this.timer.textContent = `${this.min}:0${this.sec}`;
      } else if (this.min > 9 && this.sec > 9) {
        this.timer.textContent = `${this.min}:${this.sec}`;
      }
      this.sec += 1;
    }, 1000);
  }

  async transformButtonsOn() {
    // тут был запрос на геопозицию
    this.timer.classList.remove('none');
    this.timerRec();
    this.videoBtn.classList.remove('organizer-input-video');
    this.videoBtn.classList.add('image-cancel');
    this.audioBtn.classList.remove('organizer-input-audio');
    this.audioBtn.classList.add('image-ok');
  }

  transformButtonsOff() {
    this.timer.classList.add('none');
    this.videoBtn.classList.add('organizer-input-video');
    this.videoBtn.classList.remove('image-cancel');
    this.audioBtn.classList.add('organizer-input-audio');
    this.audioBtn.classList.remove('image-ok');
  }

  async record(type) {
    this.createElement = document.createElement(type);
    this.createElement.controls = true;
    this.recorder = new Record(this.createElement, type);
    await this.recorder.createRecord();

    if (!window.MediaRecorder || this.recorder.error !== null) {
      await notificationBox();
      this.recorder = null;
      this.createElement = null;
    } else {
      this.transformButtonsOn();
    }
  }

  cancelRecord() {
    clearInterval(this.timerId);
    this.min = 0;
    this.sec = 0;
    this.timer.textContent = '';
    this.recorder.recorder.stop();
    this.transformButtonsOff();
  }

  clickAudioVideo(element) {
    element.addEventListener('click', () => {
      if (this.timer.classList.contains('none') && element.classList.contains('organizer-input-audio')) {
        this.record('audio');
      } else if (this.timer.classList.contains('none') && element.classList.contains('organizer-input-video')) {
        this.record('video');
      } else if (!this.timer.classList.contains('none') && element.classList.contains('image-ok')) {
        this.cancelRecord();
        const record = Organizer.createRecord(this.createElement);
        this.addDataToOrgRecords(record);
      } else if (!this.timer.classList.contains('none') && element.classList.contains('image-cancel')) {
        this.cancelRecord();
      }
    });
  }

  inputText() {
    this.organizerInputText.addEventListener('input', (ev) => {
      this.message = ev.target.value.replace(/\n/g, '');
    });
  }

  static scrollToBottom(element) {
    element.scrollTo({
      top: element.scrollHeight,
      behavior: 'smooth',
    });
  }

  inputTextEnter() {
    this.organizerInputText.addEventListener('keyup', (ev) => {
      if (ev.key === 'Enter' && this.message !== null && this.message !== '') {
        this.createDataMessage(this.message);
      }
    });
    this.organizerInputText.addEventListener('blur', () => {
      this.organizerInputText.value = '';
    });
  }

  inputTextClickBtnEnter() {
    this.enterBtn.addEventListener('click', () => {
      if (this.message !== null && this.organizerInputText.value !== null && this.message !== '') {
        this.createDataMessage(this.message);
      }
    });
  }

  static getDate() {
    const year = new Date().getFullYear();
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let hours = new Date().getHours();
    let minute = new Date().getMinutes();

    if (String(month).length === 1) {
      month = `0${month}`;
    }
    if (String(day).length === 1) {
      day = `0${day}`;
    }
    if (String(minute).length === 1) {
      minute = `0${minute}`;
    }
    if (String(hours).length === 1) {
      hours = `0${hours}`;
    }
    return `${day}.${month}.${String(year).slice(2)} ${hours}:${minute}`;
  }
}
