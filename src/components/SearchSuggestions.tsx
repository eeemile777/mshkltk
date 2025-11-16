import React from 'react';
import { SearchSuggestion } from '../types';
import { AppContext } from '../contexts/AppContext';
import { FaRegFileLines, FaMapPin } from 'react-icons/fa6';

interface SearchSuggestionsProps {
  suggestions: SearchSuggestion[];
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
}

const SuggestionIcon: React.FC<{ type: 'area' | 'report' }> = ({ type }) => {
    const commonClasses = "w-5 h-5 text-text-secondary dark:text-text-secondary-dark flex-shrink-0";
    if (type === 'area') {
        return <span className={commonClasses}><FaMapPin /></span>;
    }
    return <span className={commonClasses}><FaRegFileLines /></span>;
};

const SearchSuggestions: React.FC<SearchSuggestionsProps> = ({ suggestions, onSuggestionClick }) => {
    const { t } = React.useContext(AppContext);

    if (suggestions.length === 0) {
        return (
            <div className="absolute top-full mt-2 w-full bg-card dark:bg-surface-dark rounded-xl shadow-lg p-4 text-center border border-border-light dark:border-border-dark">
                <p className="text-text-secondary dark:text-text-secondary-dark text-sm">No results found.</p>
            </div>
        );
    }
    
    return (
        <div className="absolute top-full mt-2 w-full bg-card dark:bg-surface-dark rounded-xl shadow-lg z-10 overflow-hidden border border-border-light dark:border-border-dark">
            <ul role="listbox">
                {suggestions.map((suggestion) => (
                    <li key={suggestion.type === 'report' && suggestion.id ? suggestion.id : `${suggestion.type}-${suggestion.text}`} className="border-b border-border-light dark:border-border-dark last:border-b-0">
                        <button
                            onClick={() => onSuggestionClick(suggestion)}
                            className="w-full text-left flex items-center gap-4 px-4 py-3 hover:bg-muted dark:hover:bg-bg-dark transition-colors"
                            role="option"
                            aria-selected="false"
                        >
                            <SuggestionIcon type={suggestion.type} />
                            <p className="text-sm text-text-primary dark:text-text-primary-dark truncate">
                                {suggestion.text}
                            </p>
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default SearchSuggestions;