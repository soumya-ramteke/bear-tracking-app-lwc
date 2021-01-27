import { publish, MessageContext } from 'lightning/messageService';
import BEAR_LIST_UPDATE_MESSAGE from '@salesforce/messageChannel/BearListUpdate__c';
import { NavigationMixin } from 'lightning/navigation';
import { LightningElement, wire } from 'lwc';
/** BearController.searchBears(searchTerm) Apex method */
import searchBears from '@salesforce/apex/BearController.searchBears';
export default class BearList extends NavigationMixin(LightningElement) {
    searchTerm = '';
    // @wire(searchBears, { searchTerm: '$searchTerm' })
    // bears;

    bears;
    // We retrieve the Lightning message context and store it in a messageContext property
    @wire(MessageContext) messageContext;
    // We use a wired function to capture incoming bear list data and fire a custom BearListUpdate__c Ligthning message with the list of bear records.
    // pass searchTerm as a dynamic parameter to our wired searchBears adapter so that each time searchTerm changes, loadBears is re-executed and we fire a new message with the new search results
    @wire(searchBears, { searchTerm: '$searchTerm' })
    loadBears(result) {
        this.bears = result;
        if (result.data) {
            const message = {
                bears: result.data
            };
            // We use the publish function that we imported from LMS to fire a BearListUpdate__c Ligthning message with the bear list.
            publish(this.messageContext, BEAR_LIST_UPDATE_MESSAGE, message);
        }
    }

    handleSearchTermChange(event) {
        // Debouncing this method: do not update the reactive property as
        // long as this function is being called within a delay of 300 ms.
        // This is to avoid a very large number of Apex method calls.
        window.clearTimeout(this.delayTimeout);
        const searchTerm = event.target.value;
        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.delayTimeout = setTimeout(() => {
            this.searchTerm = searchTerm;
        }, 300);
    }
    get hasResults() {
        return this.bears.data.length > 0;
    }
    handleBearView(event) {
        // Get bear record id from bearview event
        const bearId = event.detail;
        // Navigate to bear record page
        this[NavigationMixin.Navigate]({
            type: 'standard__recordPage',
            attributes: {
                recordId: bearId,
                objectApiName: 'Bear__c',
                actionName: 'view'
            }
        });
    }
}
