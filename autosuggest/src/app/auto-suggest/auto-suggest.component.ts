import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

@Component({
  selector: 'app-auto-suggest',
  templateUrl: './auto-suggest.component.html',
  styleUrls: ['./auto-suggest.component.scss']
})
export class AutoSuggestComponent implements OnInit {

  private FAILURE_COEFF = 10;
  private MAX_SERVER_LATENCY = 200;
  public showDropDown = false;
  public autoSuggestInput = new FormControl();
  public autoSuggestText = "";
  public suggestions = [];
  public currentSuggestion = 1;

  constructor() { }

  @ViewChild('autoSuggestEl', {static: false}) autoSuggestEl: ElementRef

  ngOnInit() {
    this.autoSuggestInput
    .valueChanges
    .pipe(
      debounceTime(400),
      distinctUntilChanged()
    )
    .subscribe(result => {
      let arr = result.split(' ');
      this.getSuggestions(arr[arr.length - 1]).then(response => {
        if(response['length'] > 0) {
          this.suggestions = response['map'](item => {
            let obj = {
              str: item,
              current: false
            };
            item = obj;
            return item;
          });
          this.suggestions[this.currentSuggestion - 1].current = false;
          this.suggestions[0].current = true;
        }
      });
    })
  }
  
  getRandomBool(n) {
    var maxRandomCoeff = 1000;
    if (n > maxRandomCoeff) n = maxRandomCoeff;
    return Math.floor(Math.random() * maxRandomCoeff) % n === 0;
  }

  getSuggestions(text) {
    var pre = 'pre';
    var post = 'post';
    var results = [];
    if (this.getRandomBool(2)) {
      results.push(pre + text);
    }
    if (this.getRandomBool(2) && text !== '') {
      results.push(text);
    }
    if (this.getRandomBool(2)) {
      results.push(text + post);
    }
    if (this.getRandomBool(2)) {
      results.push(pre + text + post);
    }
    return new Promise((resolve, reject) => {
      var randomTimeout = Math.random() * this.MAX_SERVER_LATENCY;
      setTimeout(() => {
        if (this.getRandomBool(this.FAILURE_COEFF)) {
          reject();
        } else {
          resolve(results);
        }
      }, randomTimeout);
    });
  }

  handleFocus(el) {
    this.showDropDown = true;
    this.getSuggestions('').then(response => {
      if(response['length'] > 0) {
        this.suggestions = response['map'](item => {
          let obj = {
            str: item,
            current: false
          };
          item = obj;
          return item;
        });
        this.suggestions[this.currentSuggestion - 1].current = false;
        this.suggestions[0].current = true;
      } else {
        this.handleFocus(el);
      }
    });

  }

  handleBlur() {
    // this.showDropDown = false;
  }

  handleKeyPress(event) {
    if (event.defaultPrevented) {
      return; // Do nothing if the event was already processed
    }
    switch(event.key) {
      case "Down": // IE/Edge specific value
      case "ArrowDown":
        this.suggestions[this.currentSuggestion - 1].current = false;
        let tempCurrentSuggestion = ++this.currentSuggestion;
        this.currentSuggestion = (tempCurrentSuggestion > this.suggestions.length)? tempCurrentSuggestion % this.suggestions.length : tempCurrentSuggestion;
        this.suggestions[this.currentSuggestion - 1].current = true;
        break;
      case "Up": // IE/Edge specific value
      case "ArrowUp":
        this.suggestions[this.currentSuggestion - 1].current = false;
        this.currentSuggestion = (this.currentSuggestion === 1)? this.suggestions.length : --this.currentSuggestion;
        this.suggestions[this.currentSuggestion - 1].current = true;
        break;
      case "Right": // IE/Edge specific value
      case "ArrowRight":
      case "Enter":
        this.addSuggestion(this.suggestions[this.currentSuggestion - 1].str)
        break;
      case "Esc": // IE/Edge specific value
      case "Escape":
        // Do something for "esc" key press.
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  addSuggestion(suggestion) {
    console.log('suggestion');
    let arr = this.autoSuggestText.split(' ');
    if(arr.length === 0) {
      arr = [suggestion];
    } else {
      arr[arr.length - 1] = suggestion;
    }
    this.autoSuggestText = arr.join(' ') + ' ';
    setTimeout(() => {
      this.autoSuggestEl.nativeElement.focus();
    }, 500);
  }
}
