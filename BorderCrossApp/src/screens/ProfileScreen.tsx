import React, { memo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Switch,
  SafeAreaView,
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Icon from '../components/Icon';

interface CustomListIconProps {
  icon: string;
  color?: string;
}

const CustomListIcon = memo(({ icon, color, ...props }: CustomListIconProps & any) => (
  <Text style={{ fontSize: 24, color: color || '#666' }}>{icon}</Text>
));

interface CustomSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

const CustomSwitch = memo(({ value, onValueChange }: CustomSwitchProps) => {
  const { theme } = useTheme();
  return (
    <Switch 
      value={value} 
      onValueChange={onValueChange}
      trackColor={{ false: theme.colors.border, true: theme.colors.accent + '80' }}
      thumbColor={value ? theme.colors.accent : theme.colors.textTertiary}
    />
  );
});

interface FavoriteCrossingItemProps {
  crossing: string;
}

const FavoriteCrossingItem = memo(({ crossing }: FavoriteCrossingItemProps) => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.listItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
          <Icon name="star" size={20} color={theme.colors.accent} />
        </View>
        <View>
          <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>{crossing}</Text>
          <Text style={[styles.listItemDescription, { color: theme.colors.textSecondary }]}>
            Border Crossing
          </Text>
        </View>
      </View>
      <View style={styles.listItemRight}>
        <Icon name="chevron-right" size={16} color={theme.colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
});

interface SettingsItemProps {
  title: string;
  description: string;
  icon: string;
  value?: boolean;
  onValueChange?: (value: boolean) => void;
  showSwitch?: boolean;
  onPress?: () => void;
}

const SettingsItem = memo(({ title, description, icon, value, onValueChange, showSwitch, onPress }: SettingsItemProps) => {
  const { theme } = useTheme();
  
  const getIconName = (iconEmoji: string) => {
    switch (iconEmoji) {
      case '🎨': return 'settings';
      case '🔔': return 'bell';
      case '📍': return 'location';
      case '🗣️': return 'help'; // Using help as a fallback for speaking
      case '📏': return 'gear'; // Using gear as a fallback for ruler
      default: return 'help';
    }
  };
  
  return (
    <TouchableOpacity style={styles.listItem} onPress={onPress}>
      <View style={styles.listItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.accent + '20' }]}>
          <Icon name={getIconName(icon)} size={20} color={theme.colors.accent} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>{title}</Text>
          <Text style={[styles.listItemDescription, { color: theme.colors.textSecondary }]}>
            {description}
          </Text>
        </View>
      </View>
      <View style={styles.listItemRight}>
        {showSwitch ? (
          <CustomSwitch value={value!} onValueChange={onValueChange!} />
        ) : (
          <Icon name="chevron-right" size={16} color={theme.colors.textTertiary} />
        )}
      </View>
    </TouchableOpacity>
  );
});

interface HelpSupportItemProps {
  title: string;
  icon: string;
}

const HelpSupportItem = memo(({ title, icon }: HelpSupportItemProps) => {
  const { theme } = useTheme();
  
  const getIconName = (iconEmoji: string) => {
    switch (iconEmoji) {
      case '❓': return 'help';
      case '🔒': return 'lock';
      case '📄': return 'document';
      default: return 'help';
    }
  };
  
  return (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.listItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.textTertiary + '20' }]}>
          <Icon name={getIconName(icon)} size={20} color={theme.colors.textTertiary} />
        </View>
        <Text style={[styles.listItemTitle, { color: theme.colors.text }]}>{title}</Text>
      </View>
      <View style={styles.listItemRight}>
        <Icon name="chevron-right" size={16} color={theme.colors.textTertiary} />
      </View>
    </TouchableOpacity>
  );
});

const SignOutItem = memo(() => {
  const { theme } = useTheme();
  return (
    <TouchableOpacity style={styles.listItem}>
      <View style={styles.listItemLeft}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.error + '20' }]}>
          <Icon name="sign-out" size={20} color={theme.colors.error} />
        </View>
        <Text style={[styles.listItemTitle, { color: theme.colors.error }]}>Sign Out</Text>
      </View>
    </TouchableOpacity>
  );
});

const ProfileScreen = () => {
  const { theme, isDark, toggleTheme, themeMode } = useTheme();
  const [notificationsEnabled, setNotificationsEnabled] = React.useState(true);
  const [locationEnabled, setLocationEnabled] = React.useState(true);

  const user = {
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: 'https://placeimg.com/140/140/people',
    memberSince: '2024',
    crossingsThisMonth: 12,
    favoritesCrossings: ['San Ysidro', 'Otay Mesa'],
  };

  const getThemeDescription = () => {
    switch (themeMode) {
      case 'light':
        return 'Light mode';
      case 'dark':
        return 'Dark mode';
      case 'system':
        return `System (${isDark ? 'Dark' : 'Light'})`;
      default:
        return 'System';
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView 
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.header, { backgroundColor: theme.colors.card }]}>
          <Image
            source={{ uri: user.avatar }}
            style={styles.avatar}
          />
          <Text style={[styles.name, { color: theme.colors.text }]}>{user.name}</Text>
          <Text style={[styles.email, { color: theme.colors.textSecondary }]}>{user.email}</Text>
          <Text style={[styles.memberSince, { color: theme.colors.textTertiary }]}>
            Member since {user.memberSince}
          </Text>
        </View>

        <View style={[styles.statsCard, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>This Month</Text>
          <View style={styles.statsContainer}>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: theme.colors.accent }]}>
                {user.crossingsThisMonth}
              </Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Border Crossings
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: theme.colors.accent }]}>2.5</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Avg Wait (hrs)
              </Text>
            </View>
            <View style={styles.stat}>
              <Text style={[styles.statNumber, { color: theme.colors.accent }]}>45</Text>
              <Text style={[styles.statLabel, { color: theme.colors.textSecondary }]}>
                Time Saved (min)
              </Text>
            </View>
          </View>
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Favorite Crossings</Text>
          {user.favoritesCrossings.map((crossing, index) => (
            <FavoriteCrossingItem key={index} crossing={crossing} />
          ))}
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Settings</Text>
          <SettingsItem
            title="Theme"
            description={getThemeDescription()}
            icon="🎨"
            onPress={toggleTheme}
          />
          <SettingsItem
            title="Push Notifications"
            description="Get alerts about wait times and delays"
            icon="🔔"
            value={notificationsEnabled}
            onValueChange={setNotificationsEnabled}
            showSwitch={true}
          />
          <SettingsItem
            title="Location Services"
            description="Allow app to access your location"
            icon="📍"
            value={locationEnabled}
            onValueChange={setLocationEnabled}
            showSwitch={true}
          />
          <SettingsItem
            title="Language"
            description="English"
            icon="🗣️"
          />
          <SettingsItem
            title="Units"
            description="Imperial (miles, °F)"
            icon="📏"
          />
        </View>

        <View style={[styles.card, { backgroundColor: theme.colors.card }]}>
          <HelpSupportItem title="Help & Support" icon="❓" />
          <HelpSupportItem title="Privacy Policy" icon="🔒" />
          <HelpSupportItem title="Terms of Service" icon="📄" />
          <View style={[styles.divider, { backgroundColor: theme.colors.border }]} />
          <SignOutItem />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 24,
    paddingTop: 20,
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 12,
  },
  name: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  email: {
    fontSize: 16,
    marginBottom: 4,
  },
  memberSince: {
    fontSize: 14,
  },
  statsCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  card: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 0,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  textContainer: {
    flex: 1,
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  listItemDescription: {
    fontSize: 14,
  },
  listItemRight: {
    marginLeft: 12,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
});

export default ProfileScreen;